import { createContext, type ReactNode, useContext } from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

const Ctx = createContext<SharedValue<number> | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollY = useSharedValue(0);
  return <Ctx.Provider value={scrollY}>{children}</Ctx.Provider>;
}

export function useScrollY(): SharedValue<number> {
  const v = useContext(Ctx);
  if (!v) throw new Error('useScrollY must be used inside ScrollProvider');
  return v;
}
