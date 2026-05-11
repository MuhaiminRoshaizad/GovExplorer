import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { storage, StorageKeys } from '@/lib/storage';

import { DEFAULT_STATE_CODE, findState, type MalaysiaState, STATES, type StateCode } from './states';

type Ctx = {
  code: StateCode;
  state: MalaysiaState;
  setCode: (code: StateCode) => void;
};

const StateCtx = createContext<Ctx | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<StateCode>(DEFAULT_STATE_CODE);

  useEffect(() => {
    storage.getJSON<StateCode>(StorageKeys.homeLocation).then((stored) => {
      if (stored) setCodeState(stored);
    });
  }, []);

  const setCode = (c: StateCode) => {
    setCodeState(c);
    storage.setJSON(StorageKeys.homeLocation, c).catch(() => {});
  };

  const value = useMemo<Ctx>(
    () => ({
      code,
      state: findState(code) ?? STATES[0],
      setCode,
    }),
    [code]
  );

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

export function useStatePref(): Ctx {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useStatePref must be used inside StateProvider');
  return ctx;
}
