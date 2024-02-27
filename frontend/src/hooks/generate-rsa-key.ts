import NodeRSA from 'node-rsa';

export const useGenerateKeys = () => {
  const publicKeyLocalStorage = localStorage.getItem('publicKey');
  const privateKeyLocalStorage = localStorage.getItem('privateKey');

  if (!publicKeyLocalStorage || !privateKeyLocalStorage) {
    const key = new NodeRSA({ b: 512 });

    const publicKey = key.exportKey('public');
    const privateKey = key.exportKey('private');
    localStorage.setItem('publicKey', publicKey);
    localStorage.setItem('privateKey', privateKey);
  }

  return { publicKey: publicKeyLocalStorage, privateKey: privateKeyLocalStorage };
};
