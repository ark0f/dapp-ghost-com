#![no_std]

extern crate alloc;

use alloc::collections::BTreeMap;
use gstd::{msg, ActorId};
use io::{HandleIn, HandleOut};

static mut STATES: BTreeMap<ActorId, State> = BTreeMap::new();

fn states() -> &'static mut BTreeMap<ActorId, State> {
    unsafe { &mut STATES }
}

enum State {
    HandshakeStarted { remote: ActorId },
    RespondedToInitiator,
}

#[no_mangle]
extern "C" fn init() {}

#[no_mangle]
extern "C" fn handle() {
    let action: HandleIn = msg::load().unwrap();
    match action {
        HandleIn::StartHandshake {
            remote,
            initiator_public_key,
        } => {
            let initiator = msg::source();
            msg::send(
                remote,
                HandleOut::InitiatorPublicKey {
                    initiator_public_key,
                },
                0,
            )
            .unwrap();
            states().insert(initiator, State::HandshakeStarted { remote });
        }
        HandleIn::RespondToInitiator {
            initiator,
            remote_enc_signal,
        } => {
            let remote = msg::source();

            let Some(state) = states().get(&initiator) else {
                panic!("Session not found for the initiator");
            };

            let saved_remote = match state {
                State::HandshakeStarted { remote } => remote,
                State::RespondedToInitiator { .. } => {
                    panic!("Handshake negotiation sequence violated");
                }
            };

            if *saved_remote != remote {
                panic!("Your address is not associated with the initiator")
            }

            msg::send(
                initiator,
                HandleOut::RemoteEncodedSignal { remote_enc_signal },
                0,
            )
            .unwrap();

            states().insert(initiator, State::RespondedToInitiator);
        }
        HandleIn::RespondToRemote {
            remote,
            initiator_enc_signal,
        } => {
            let initiator = msg::source();

            let Some(state) = states().get(&initiator) else {
                panic!("Session not found for the initiator");
            };

            match state {
                State::HandshakeStarted { .. } => {
                    panic!("Handshake negotiation sequence violated");
                }
                State::RespondedToInitiator => {}
            };

            msg::send(
                remote,
                HandleOut::InitiatorEncodedSignal {
                    initiator_enc_signal,
                },
                0,
            )
            .unwrap();

            states().remove(&initiator);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec;
    use gtest::constants::EXISTENTIAL_DEPOSIT;
    use gtest::{Log, Program, System};

    #[test]
    fn full_handshake() {
        const CONTRACT_CREATOR: u64 = 0xff;
        const INITIATOR: u64 = 0;
        const REMOTE: u64 = 1;

        let system = System::new();
        system.init_logger();
        system.mint_to(CONTRACT_CREATOR, EXISTENTIAL_DEPOSIT * 100);
        system.mint_to(INITIATOR, EXISTENTIAL_DEPOSIT * 10);
        system.mint_to(REMOTE, EXISTENTIAL_DEPOSIT * 10);

        let program = Program::current(&system);

        let initiator_public_key = vec![1, 2, 3];
        let initiator_enc_signal = vec![4, 5, 6];
        let remote_enc_signal = vec![3, 2, 1];

        // init
        program.send_bytes(CONTRACT_CREATOR, b"");

        // start handshake
        program.send(
            INITIATOR,
            HandleIn::StartHandshake {
                remote: REMOTE.into(),
                initiator_public_key: initiator_public_key.clone(),
            },
        );

        let remote_mailbox = system.get_mailbox(REMOTE);
        let expected_message = Log::builder().payload_bytes(initiator_public_key);
        assert!(remote_mailbox.contains(&expected_message));

        // respond to initiator
        program.send(
            REMOTE,
            HandleIn::RespondToInitiator {
                initiator: INITIATOR.into(),
                remote_enc_signal: remote_enc_signal.clone(),
            },
        );

        let initiator_mailbox = system.get_mailbox(INITIATOR);
        let expected_message = Log::builder().payload_bytes(remote_enc_signal);
        assert!(initiator_mailbox.contains(&expected_message));

        // respond to remote
        program.send(
            INITIATOR,
            HandleIn::RespondToRemote {
                remote: REMOTE.into(),
                initiator_enc_signal: initiator_enc_signal.clone(),
            },
        );

        let remote = system.get_mailbox(REMOTE);
        let expected_message = Log::builder().payload_bytes(initiator_enc_signal);
        assert!(remote.contains(&expected_message));
    }
}
