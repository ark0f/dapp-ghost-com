import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { useEffect } from 'react';

const isAppReadyAtom = atom<boolean>(false);

export function useIsAppReady() {
  const isAppReady = useAtomValue(isAppReadyAtom);
  const setIsAppReady = useSetAtom(isAppReadyAtom);

  return { isAppReady, setIsAppReady };
}

export function useIsAppReadySync() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const { setIsAppReady } = useIsAppReady();

  console.log('----------------');
  console.log(isApiReady);
  console.log(isAccountReady);
  useEffect(() => {
    setIsAppReady(isApiReady && isAccountReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountReady, isApiReady]);
}
