import { FC, memo, useEffect, useState } from 'react';
import { Input, Button } from '@gear-js/vara-ui';
import { useGenerateKeys } from '@/hooks/generate-rsa-key';
import { useChat, useChatPeerConnectionSubscription } from '@/features/chat/module/useChat/useChat';
import { useGameMessage } from '@/features/chat/hooks';
import { Invite, onHandleEvents } from './hanldeEvents';
import { Container } from '@/components';

import { Chat as ChatMessages } from '@/features/chat/components/chat'
import { decryptData, encryptData } from '@/utils';

import LogoGhost from '@/assets/logo_02.png'

const Chat: FC = memo(function Chat() {
	const [isDisableConnect, setDisableConnect] = useState(false)
	const { publicKey, privateKey } = useGenerateKeys();
	const [accountAddress, setAccountAddress] = useState("");
	const { mode, isConnected, localConnectionDescription, startAsHost, startAsSlave, setRemoteConnectionDescription, isDisconnected } = useChat();
	const handleMessage = useGameMessage();
	const { invites, remoteEncodedSignal, initiatorEncodedSignal } = onHandleEvents()
	const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);

	const [isPending, setPending] = useState(false)

	useChatPeerConnectionSubscription();

	const onClickInviteChat = () => {
		if (accountAddress) {
			handleMessage({
				payload: {
					StartHandshake: {
						remote: accountAddress,
						['initiator_public_key']: publicKey,
					},
				},
			});
		}
	};

	const onCreateChat = () => {
		if (localConnectionDescription?.description && selectedInvite) {
			const privateConnectionDescription = encryptData(localConnectionDescription.description, selectedInvite.initiatorPublicKey);
			setDisableConnect(true)

			handleMessage({
				payload: {
					InitialSignalCreated: {
						initiator: selectedInvite.initiator,
						['remote_public_key']: publicKey,
						['remote_enc_signal']: privateConnectionDescription,
					},
				},
				onSuccess: () => {
					setSelectedInvite(null);
					setDisableConnect(false)
				}
			});

			setPending(false)
		}
	};


	const onConnect = (invite: Invite) => {
		setPending(true)
		setSelectedInvite(invite);
		startAsHost();
	};

	const onConnectSlave = () => {
		if (remoteEncodedSignal?.RemoteEncodedSignal.remoteEncSignal && privateKey) {
			const remoteSignal = decryptData(remoteEncodedSignal?.RemoteEncodedSignal.remoteEncSignal, privateKey);

			if (remoteSignal && publicKey) {

				startAsSlave({ description: remoteSignal, encryptionKey: publicKey });

				const cleanHexString = remoteEncodedSignal.RemoteEncodedSignal.remotePublicKey.substring(2);
				const buffer = Buffer.from(cleanHexString, 'hex');
				const publicKeyString = buffer.toString('utf8');

				if (localConnectionDescription) {
					const privateConnectionDescription = encryptData(localConnectionDescription.description, publicKeyString);
					handleMessage({
						payload: {
							PairedSignalCreated: {
								remote: accountAddress,
								['initiator_enc_signal']: privateConnectionDescription,
							},
						},
						onSuccess: () => {
							setSelectedInvite(null);
							setDisableConnect(false)
						}
					});
				}
			}
		}

	};

	const onSetInitiatorEncodedSignal = () => {
		if (initiatorEncodedSignal && initiatorEncodedSignal?.InitiatorEncodedSignal && privateKey) {
			const initiatorSignal = decryptData(initiatorEncodedSignal.InitiatorEncodedSignal.InitiatorEncSignal, privateKey);
			if (initiatorSignal) {
				setRemoteConnectionDescription({ description: initiatorSignal, encryptionKey: publicKey });
			}
		}

	}

	useEffect(() => {
		if (selectedInvite && !isDisableConnect) {
			onCreateChat();
		}
	}, [selectedInvite, localConnectionDescription]);

	useEffect(() => {
		if (remoteEncodedSignal) {
			onConnectSlave()
		}
	}, [remoteEncodedSignal, localConnectionDescription])

	useEffect(() => {
		if (initiatorEncodedSignal) {
			onSetInitiatorEncodedSignal()
		}
	}, [initiatorEncodedSignal])

	useEffect(() => {
		if (isConnected && !isDisconnected) {
			const handleBeforeUnload = (e: { preventDefault: () => void; returnValue: string; }) => {
				e.preventDefault();
				e.returnValue = '';
			};

			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}

		if (isDisconnected) {
			alert("Session has been ended")
			window.location.reload()
		}
	}, [isConnected, isDisconnected]);

	return (
		<Container>
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, width: 800, marginLeft: "auto", marginRight: "auto" }}>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<img src={LogoGhost} alt="" width={300} />
				</div>

				{isPending && <h1>Connecting...</h1>}

				{invites.length > 0 &&
					<div>
						{invites[0] &&
							<Button
								key={invites[0].initiator}
								onClick={() => onConnect(invites[0])}
								disabled={isDisableConnect || isPending}
								isLoading={isDisableConnect || isPending}
							>
								{invites[0].initiator}
							</Button>
						}
					</div>
				}
				<div style={{ width: "100%" }}>
					{mode && isConnected && <ChatMessages />}
				</div>

				<div style={{ display: "flex", gap: 10, justifyContent: "space-between", width: "100%", alignItems: "center" }}>
					{!isConnected && !mode && <Input label="Enter the account address" value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} style={{ width: "100%" }} />}
					{isConnected && mode && <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>{mode}/{isConnected && "Connected"}</div>}
					{!isConnected && !mode && <Button disabled={!accountAddress} onClick={onClickInviteChat}>Create chat</Button>}
				</div>
			</div>


		</Container>
	);
});

export default Chat
