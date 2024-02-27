import { useCallback } from 'react';
import { nanoid } from 'nanoid';

import { MessageType, MessageTextType, MessageFileInfoType, MessageFileChunkType } from '../../types/MessageType';
import { usePeerConnection, usePeerConnectionSubscription } from '../../../../context/PeerConnection';
// import { useOnFileBufferReceived } from '../FileBuffers/FileBuffers';
import { MESSAGE_SENDER } from '../../types/MessageSenderEnum';
import { MESSAGE_TYPE } from '../../types/MessageTypeEnum';
import { useChatMessages } from '../ChatMessages/ChatMessages';
import { ChatMessageType } from '../../types/ChatMessageType';

export interface SendFileInfoProps {
  fileId: string;
  fileName: string;
  fileSize: number;
}

export interface SendFileChunkProps {
  fileId: string;
  fileChunkIndex: number;
  fileChunk: string;
}

export const useChat = () => {
  // const { onFileInfoUploaded, onFileChunkUploaded } = useOnFileBufferReceived();
  const { chatMessages, sendChatMessage } = useChatMessages();

  const {
    mode,
    isConnected,
    localConnectionDescription,
    startAsHost,
    startAsSlave,
    setRemoteConnectionDescription,
    sendMessage,
    isDisconnected,
  } = usePeerConnection<ChatMessageType>();

  const sendTextChatMessage = useCallback(
    (messageText: string) => {
      const message: MessageTextType = {
        id: nanoid(),
        sender: MESSAGE_SENDER.STRANGER,
        type: MESSAGE_TYPE.TEXT,
        timestamp: +new Date(),
        payload: messageText,
      };

      sendMessage(message);
      sendChatMessage({
        id: message.id,
        sender: MESSAGE_SENDER.ME,
        timestamp: message.timestamp,
        text: message.payload,
      });
    },
    [sendMessage, sendChatMessage],
  );

  return {
    mode,
    isConnected,
    localConnectionDescription,
    chatMessages,
    isDisconnected,
    startAsHost,
    startAsSlave,
    setRemoteConnectionDescription,
    sendTextChatMessage,
    // sendFileInfo,
    // sendFileChunk,
  };
};

// This hook should be used only in one place since it's connecting Chat to PeerConnection
export const useChatPeerConnectionSubscription = () => {
  // const { onFileInfoReceived, onFileChunkReceived } = useOnFileBufferReceived();
  const { sendChatMessage } = useChatMessages();

  const onMessageReceived = useCallback(
    (message: MessageType) => {
      if (message.type === MESSAGE_TYPE.TEXT) {
        sendChatMessage({
          id: message.id,
          sender: MESSAGE_SENDER.STRANGER,
          timestamp: message.timestamp,
          text: message.payload,
        });
      }
    },
    [sendChatMessage],
  );

  usePeerConnectionSubscription(onMessageReceived);
};
