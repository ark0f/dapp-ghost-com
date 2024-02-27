/* eslint-disable @typescript-eslint/no-use-before-define */
const CHANNEL_LABEL = 'P2P_CHAT_CHANNEL_LABEL';

export interface CreatePeerConnectionProps {
  remoteDescription?: string;
  iceServers?: RTCIceServer[];
  onChannelOpen: () => any;
  onMessageReceived: (message: string) => any;
  onConnectionClosed?: () => any;
}

export interface CreatePeerConnectionResponse {
  localDescription: string;
  setAnswerDescription: (answerDescription: string) => void;
  sendMessage: (message: string) => void;
}

export function createPeerConnection({
  remoteDescription,
  iceServers = [],
  onChannelOpen,
  onMessageReceived,
  onConnectionClosed,
}: CreatePeerConnectionProps): Promise<CreatePeerConnectionResponse> {
  const peerConnection = new RTCPeerConnection({
    iceServers,
  });
  let channelInstance: RTCDataChannel;

  peerConnection.onicecandidateerror = (e) => {
    console.error('peerConnection.onicecandidateerror', e);
  };
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE Connection State Change:', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'disconnected') {
      console.log('Попытка восстановления соединения...');
      // Здесь может быть логика для восстановления соединения
      // Например, повторный вызов createOffer() для инициатора соединения
      createOffer();
    }
  };

  function setupChannelAsAHost() {
    try {
      channelInstance = peerConnection.createDataChannel(CHANNEL_LABEL);
      channelInstance.onopen = function () {
        onChannelOpen();
      };

      channelInstance.onmessage = function (event) {
        onMessageReceived(event.data);
      };
    } catch (e) {
      console.error('No data channel (peerConnection)', e);
    }
  }

  async function createOffer() {
    const description = await peerConnection.createOffer();
    peerConnection.setLocalDescription(description);
  }

  function setupChannelAsASlave() {
    peerConnection.ondatachannel = function ({ channel }) {
      channelInstance = channel;
      channelInstance.onopen = function () {
        onChannelOpen();
      };

      channelInstance.onmessage = function (event) {
        onMessageReceived(event.data);
      };
    };
  }

  async function createAnswer(remoteDescription: string) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(remoteDescription)));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    // Транслируем локальное описание (answer) другому пиру
  }

  function setAnswerDescription(answerDescription: string) {
    console.log('JSON.parse(answerDescription)', JSON.parse(answerDescription));
    peerConnection.setRemoteDescription(JSON.parse(answerDescription));
  }

  function sendMessage(message: string) {
    if (channelInstance) {
      channelInstance.send(message);
    }
  }

  return new Promise((res) => {
    peerConnection.onicecandidate = function (e) {
      // console.log('e.candidate', e.candidate);
      // console.log('peerConnection.localDescription', peerConnection.localDescription);
      if (e.candidate === null && peerConnection.localDescription) {
        peerConnection.localDescription.sdp.replace('b=AS:30', 'b=AS:1638400');
        res({
          localDescription: JSON.stringify(peerConnection.localDescription),
          setAnswerDescription,
          sendMessage,
        });
      }
    };
    console.log('remoteDescription', remoteDescription);

    if (!remoteDescription) {
      setupChannelAsAHost();
      createOffer();
    } else {
      setupChannelAsASlave();
      createAnswer(remoteDescription);
    }
  });
}
