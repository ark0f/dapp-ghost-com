import { useEscrowMetadata } from "@/hooks/api";
import { HexString, UserMessageSent } from "@gear-js/api";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { UnsubscribePromise } from "@polkadot/api/types";
import { Bytes } from "@polkadot/types";
import { useEffect, useState } from "react";

export type Invite = {
	initiator: HexString;
	initiatorPublicKey: string;
}

export type RemoteEncodedSignal = {
	RemoteEncodedSignal: {
		remoteEncSignal: string;
		remotePublicKey: string;
	}
}

export const onHandleEvents = () => {
	const { api } = useApi()
	const [invites, setInvites] = useState<Invite[]>([])
	const [remoteEncodedSignal, setRemoteEncodedSignal] = useState<RemoteEncodedSignal>()
	const [initiatorEncodedSignal, setInitiatorEncodedSignal] = useState()

	const { account } = useAccount()
	const { decodedAddress } = account || {};

	const meta = useEscrowMetadata();

	const getDecodedPayload = (payload: Bytes) => {
		if (meta?.types.handle.output) {
			return meta.createType(meta.types.handle.output, payload).toHuman();
		}
	};

	const getDecodedReply = (payload: Bytes): any => {
		const decodedPayload = getDecodedPayload(payload);

		return decodedPayload as any;
	};

	const handleEvents = ({ data }: UserMessageSent) => {
		console.log('account?.decodedAddress', account?.decodedAddress)
		const { message } = data;

		const { destination, source, payload, details, id } = message;

		const detailsMessage = details.toHuman()

		if (detailsMessage) {
			return;
		}


		if (destination.toHuman() === account?.decodedAddress && !detailsMessage) {
			const reply = getDecodedReply(payload);

			if (reply.HandshakeRequested) {
				console.log('OK');
				const cleanHexString = reply.HandshakeRequested.initiatorPublicKey.substring(2);

				const buffer = Buffer.from(cleanHexString, 'hex');

				const publicKeyString = buffer.toString('utf8');
				const newReply = {
					...reply,
					HandshakeRequested: {
						...reply.HandshakeRequested,
						initiatorPublicKey: publicKeyString
					}
				};
				setInvites(prev => [...prev, newReply.HandshakeRequested]);
			}


			console.log('reply', reply)

			if (reply.RemoteEncodedSignal) {
				console.log('id.toHuman()', id.toHuman())
				const encryptedDataBuffer = Buffer.from(reply.RemoteEncodedSignal.remoteEncSignal, 'base64');

				const newReply = {
					...reply,
					RemoteEncodedSignal: {
						...reply.RemoteEncodedSignal,
						remoteEncSignal: encryptedDataBuffer
					}
				};
				console.log('newReply', newReply)
				setRemoteEncodedSignal(newReply);
			}

			if (reply.InitiatorEncodedSignal) {
				const encryptedDataBuffer = Buffer.from(reply.InitiatorEncodedSignal.initiatorEncSignal, 'base64');

				const newReply = {
					...reply,
					InitiatorEncodedSignal: {
						...reply.InitiatorEncodedSignal,
						InitiatorEncSignal: encryptedDataBuffer
					}
				};
				console.log('newReply', newReply)
				setInitiatorEncodedSignal(newReply);
			}
		} else {
			setInvites([])
		}
	};

	useEffect(() => {
		let unsub: UnsubscribePromise | undefined;

		if (api && decodedAddress && meta) {
			unsub = api.gearEvents.subscribeToGearEvent('UserMessageSent', handleEvents);
		}

		return () => {
			if (unsub) unsub.then((unsubCallback) => unsubCallback());
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, decodedAddress, meta]);

	return { invites, remoteEncodedSignal, initiatorEncodedSignal };
}

