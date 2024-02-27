import React, { useState, createRef, FC, memo } from 'react';
// import styled from 'styled-components';
import copy from 'copy-to-clipboard';

import { encode, decode } from '../../util/connectionDescriptionEncoding';
// import { connectionDescriptionValidator } from '../../util/connectionDescriptionValidator';
// import { PageHeader } from '../PageHeader/PageHeader';
// import { TextArea } from '../TextArea/TextArea';
// import { Button } from '../Button/Button';
import { useChat } from '../../module/useChat/useChat';
import { ConnectionDescription } from '../../../../context/PeerConnection';
import { Container } from '@/components';
import { Button, Textarea } from '@gear-js/vara-ui';

// const ErrorMessage = styled.div``;
// const StyledTextArea = styled(TextArea)`
//   width: 70%;
// `;
// const ConnectButton = styled(Button)`
//   width: 70%;
//   margin-top: 4px;
// `;
// const CopyButton = styled(Button)`
//   width: 70%;
//   margin-top: 4px;
// `;
// const Form = styled.form`
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// `;
// const Instruction = styled.div`
//   font-size: 10px;
//   color: black;
//   margin-bottom: 4px;
// `;
// const Step = styled.div`
//   position: absolute;
//   top: 8px;
//   left: 8px;
//   width: 18px;
//   height: 18px;
//   background-color: black;
//   color: white;
//   font-size: 10px;
//   border-radius: 50%;
//   line-height: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   text-align: center;

//   > span {
//     display: inline-block;
//     transform: translate(0.5px, -0.5px);
//   }
// `;
// const Card = styled.div`
//   position: relative;
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 24px;
//   border: 1px solid black;
//   border-top: none;
// `;
// const Container = styled.div`
//   width: 100%;
//   display: flex;
//   flex-direction: column;
// `;

export interface HostProps {
  connectionDescription: ConnectionDescription;
  onSubmit: (remoteConnectionDescription: ConnectionDescription) => any;
}

export const Host: FC = memo(function Host() {
  const { localConnectionDescription, setRemoteConnectionDescription, isConnected } = useChat();
  const [remoteConnectionDescriptionInputValue, setRemoteConnectionDescriptionInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const copyTextAreaRef = createRef<HTMLDivElement>();

  const encodedConnectionDescription = localConnectionDescription && encode(localConnectionDescription as ConnectionDescription);

  const handleCopyClick = () => {
    if (encodedConnectionDescription) {
      copy(encodedConnectionDescription);
    }
  };

  const handleRemoteConnectionDescriptionInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setRemoteConnectionDescriptionInputValue(event.target.value);
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    try {
      event.stopPropagation();
      event.preventDefault();
      const connectionDescriptionObject = decode(remoteConnectionDescriptionInputValue);
      setRemoteConnectionDescription(connectionDescriptionObject);
    } catch (error) {
      setError('Connection Description invalid!');
    }
  };

  return (
    <Container>
      {!encodedConnectionDescription ? <h1>Waiting for connection...</h1> :
        <div>
          <div>
            <Button onClick={handleCopyClick}>Copy to clipboard code connection</Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div>Code from your buddy:</div>
            <Textarea
              value={remoteConnectionDescriptionInputValue}
              onChange={handleRemoteConnectionDescriptionInputChange}
              placeholder="Paste an answer code"
            />
            <Button type="submit">Connect</Button>
          </form>
        </div>
      }
    </Container>
  );
});
