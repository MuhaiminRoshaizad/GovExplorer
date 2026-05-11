import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkTheme, lightTheme, type Mode, type Theme } from './theme';

type Preference = Mode | 'system';

type ThemeCtx = {
  theme: Theme;
  mode: Mode;
  preference: Preference;
  setPreference: (p: Preference) => void;
};

const STORAGE_KEY = 'govexplorer.themePreference';

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<Preference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = (p: Preference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  };

  const mode: Mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(() => ({ theme, mode, preference, setPreference }), [theme, mode, preference]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
