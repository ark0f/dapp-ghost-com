


import { Container } from '@/components';
import { Chat, Host, HostOrSlave, Slave } from '@/features/chat/components';
// import { useGenerateKeys } from '@/hooks/use-generate-keys';

// import { FileBuffersProvider } from '@/features/chat/module/FileBuffers/FileBuffers';
import { PEER_CONNECTION_MODE } from '@/context/PeerConnection';
import { useEffect } from 'react';
import { useChat } from '@/features/chat/module/useChat/useChat';
// import { useSubscriptionOnMessage } from '@/features/chat/hooks';


function Home() {
  const { mode, isConnected, localConnectionDescription, isDisconnected } = useChat();

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
      {!mode && <HostOrSlave />}
      {mode === PEER_CONNECTION_MODE.HOST && !isConnected && <Host />}
      {mode === PEER_CONNECTION_MODE.SLAVE && !isConnected && <Slave />}
      {mode && isConnected && <Chat />}
    </Container>
  );
}

export { Home };
