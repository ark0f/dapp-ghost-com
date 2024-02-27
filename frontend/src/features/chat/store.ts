import { atom } from 'jotai';
// import { IGameConfig, IGameCountdown, IGameInstance } from './types';

export const stateAtom = atom<any | null | undefined>(undefined);
export const configAtom = atom<any | null>(null);
export const pendingAtom = atom<boolean>(false);
export const countdownAtom = atom<any>(undefined);
export const stateChangeLoadingAtom = atom<boolean>(false);
