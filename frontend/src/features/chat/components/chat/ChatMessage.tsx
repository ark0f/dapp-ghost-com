import React, { FC, memo } from 'react';

import { MESSAGE_SENDER } from '../../types/MessageSenderEnum';
import { ChatMessageType } from '../../types/ChatMessageType';
import { cx } from '@/utils'

import styles from './chat.module.scss'

const ChatTextMessage: FC<Props> = memo(function ChatTextMessage({ chatMessage }) {
  return (
    <div className={cx(
      styles.chatMessage,
      chatMessage.sender === MESSAGE_SENDER.ME && styles.me
    )}
    >
      <div>
        <span>{chatMessage.sender === MESSAGE_SENDER.ME ? 'Me' : 'Friend'}</span> (
        {new Date(chatMessage.timestamp).toLocaleTimeString()})
      </div>
      <div className={styles.text}>
        {chatMessage.text}
      </div>
    </div>
  );
});

interface Props {
  chatMessage: ChatMessageType;
}

export const ChatMessage: FC<Props> = memo(function ChatMessage({ chatMessage }) {

  return <ChatTextMessage chatMessage={chatMessage} />;
});
