#![no_std]

extern crate alloc;

use alloc::vec::Vec;
use gmeta::{InOut, Metadata};
use gstd::{ActorId, TypeInfo};
use parity_scale_codec::{Decode, Encode};

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = ();
    type Handle = InOut<HandleIn, HandleOut>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = ();
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum HandleIn {
    StartHandshake {
        remote: ActorId,
        /// DER format
        initiator_public_key: Vec<u8>,
    },
    RespondToInitiator {
        initiator: ActorId,
        /// WebRTC signal/code
        remote_enc_signal: Vec<u8>,
    },
    RespondToRemote {
        remote: ActorId,
        /// WebRTC signal/code
        initiator_enc_signal: Vec<u8>,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum HandleOut {
    HandshakeRequested {
        initiator: ActorId,
        initiator_public_key: Vec<u8>,
    },
    RemoteEncodedSignal {
        remote_enc_signal: Vec<u8>,
    },
    InitiatorEncodedSignal {
        initiator_enc_signal: Vec<u8>,
    },
}
