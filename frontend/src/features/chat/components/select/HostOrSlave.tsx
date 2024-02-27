import React, { FC, useState, MouseEventHandler, ChangeEventHandler, FormEventHandler, memo } from 'react';

import { decode } from '../../util/connectionDescriptionEncoding';
import { useChat } from '../../module/useChat/useChat';
import { Container } from '@/components';
import { Button, Input, Textarea } from '@gear-js/vara-ui';

import styles from './HostOrSlave.module.scss'

export const HostOrSlave: FC = memo(function HostOrSlave({ setRemoteAddress }: any) {
  const { startAsHost, startAsSlave } = useChat();
  const [connectionDescription, setConnectionDescription] = React.useState<string>('');
  const [error, setError] = useState<string>('');

  const handleHostBtnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    startAsHost();
  };

  const handleConnectionDescriptionInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setConnectionDescription(event.target.value);
  };

  const handleSlaveFormSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const connectionDescriptionObject = decode(connectionDescription);
      startAsSlave(connectionDescriptionObject);
    } catch (error) {
      setError('Connection Description invalid!');
    }
  };

  return (
    <div className={styles.select}>
      <div className={styles.newChat}>
        <Input label="Enter the account address" placeholder="0x25c..." type="text" onChange={e => setRemoteAddress(e.target.value)} />
        <Button onClick={handleHostBtnClick}>New chat</Button>
      </div>
      <form onSubmit={handleSlaveFormSubmit}>
        <div className={styles.select}>
          <Textarea
            label='Invitation code here...'
            value={connectionDescription}
            onChange={handleConnectionDescriptionInputChange}
          />
          {!!error && <div>{error}</div>}
          <Button type="submit">Join a chat</Button>
        </div>
      </form>
    </div>
  );
});
