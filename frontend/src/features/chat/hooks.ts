import { useEffect, useMemo } from 'react';
import { useAccount, useSendMessageHandler } from '@gear-js/react-hooks';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

// import { useProgramMetadata } from '@dapps-frontend/hooks';
// import { useSignlessSendMessage } from '@dapps-frontend/signless-transactions';

import meta from './assets/meta/ghost_com.meta.txt';
import { stateAtom, pendingAtom, stateChangeLoadingAtom } from './store';
import { ADDRESS } from '@/consts';
import { useProgramMetadata, useReadState } from '@/app/hooks/api';
import { useWatchMessages } from '@/hooks/use-watch-messages';
import { ProgramMetadata } from '@gear-js/api';

export function useGame() {
  const gameState = useAtomValue(stateAtom);

  const setGameState = useSetAtom(stateAtom);

  const resetGameState = () => {
    setGameState(undefined);
  };

  return { gameState, resetGameState, setGameState };
}

function useGameState() {
  const { account } = useAccount();
  const { decodedAddress } = account || {};

  const programId = ADDRESS.CONTRACT;
  const payload = useMemo(() => (decodedAddress ? { remote: decodedAddress } : undefined), [decodedAddress]);

  const { state: game, error } = useReadState<any>({ programId, meta, payload });

  return { game, error };
}

export const useInitGame = () => {
  const { account } = useAccount();
  const { game, error } = useGameState();

  const { setGameState, resetGameState } = useGame();

  useEffect(() => {
    if (!ADDRESS.CONTRACT || !account?.decodedAddress) return;
    // if (!game?.Game) return resetGameState();
    console.log('game', game);
    setGameState(game);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.decodedAddress, game]);

  return {
    isGameReady: ADDRESS.CONTRACT ? Boolean(game) : true,
    errorGame: error,
  };
};

export function useGameMessage() {
  const metadata = useProgramMetadata(meta);
  return useSendMessageHandler(ADDRESS.CONTRACT, metadata, {
    disableAlerts: true,
    isMaxGasLimit: true,
  });
}

export function usePending() {
  const [pending, setPending] = useAtom(pendingAtom);

  return { pending, setPending };
}

export function useSubscriptionOnGameMessage(meta: ProgramMetadata) {
  const { gameState, setGameState } = useGame();
  const { subscribe, unsubscribe, reply, isOpened } = useWatchMessages<any>(meta);
  const setIsLoading = useSetAtom(stateChangeLoadingAtom);

  useEffect(() => {
    if (!isOpened) return;
    const game = reply;

    if (game) {
      setGameState(game);
      unsubscribe();
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply, isOpened]);

  return {
    subscribe,
    unsubscribe,
    reply,
    isOpened,
  };
}
