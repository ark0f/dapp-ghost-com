import { Base64 } from 'js-base64';

import { ConnectionDescription } from '../../../context/PeerConnection';

export function encode(connectionDescription: ConnectionDescription): string {
  try {
    if (!connectionDescription) {
      throw new Error('encode ConnectionDescription is undefined or null');
    }
    return Base64.encode(JSON.stringify(connectionDescription));
  } catch (error) {
    console.error('Error encoding connection description:', error);
    return '';
  }
}

export function decode(connectionDescriptionCode: string): ConnectionDescription {
  try {
    if (!connectionDescriptionCode) {
      throw new Error('decode ConnectionDescriptionCode is undefined or null');
    }
    return JSON.parse(Base64.decode(connectionDescriptionCode));
  } catch (error) {
    console.error('Error decoding connection description:', error);
    return {} as ConnectionDescription;
  }
}
