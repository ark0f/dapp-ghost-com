import React, { useCallback, memo, FC, useRef, useState } from 'react';
import { useAtom } from 'jotai'

import { useChat } from '../../module/useChat/useChat';
import { ChatMessage } from './ChatMessage';
import { Container } from '@/components';
import { Button, Textarea } from '@gear-js/vara-ui';

import styles from './chat.module.scss'
import { stateChangeLoadingAtom, stateAtom } from '../../store';

export const Chat: FC = memo(function Chat() {
  const { chatMessages, sendTextChatMessage } = useChat();
  const [messageToSend, setMessageToSend] = useState<string>('');
  const formRef = useRef<HTMLFormElement>();
  const send = useCallback(() => {
    sendTextChatMessage(messageToSend);
    setMessageToSend('');
  }, [sendTextChatMessage, messageToSend, setMessageToSend]);

  const handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMessageToSend(event.target.value);
    },
    [setMessageToSend],
  );

  const handleTextAreaKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if ((event.which !== 13 && event.keyCode !== 13) || event.shiftKey) return;
      if (!formRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      send();
    },
    [send],
  );

  const handleSubmit: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      send();
    },
    [send],
  );

  return (
    <Container>
      <div>
        <div className={styles.listMessages}>
          {chatMessages.map((chatMessage, index) => {
            return (
              <ChatMessage key={chatMessage.id + index} chatMessage={chatMessage} />
            )
          }
          )}
        </div>
      </div>
      <form ref={formRef as React.MutableRefObject<HTMLFormElement>} onSubmit={handleSubmit} className={styles.sendMessage}>
        <Textarea
          label="Message..."
          value={messageToSend}
          onChange={handleTextAreaChange}
          onKeyDown={handleTextAreaKeyDown}
          required
          maxLength={300}
        />
        <Button type="submit">Send</Button>
      </form>

      {/* <Button>Close chat</Button> */}
    </Container>
  );
});
