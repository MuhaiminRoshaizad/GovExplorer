import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSetting } from '@/hooks/useSetting';
import { darkTheme, lightTheme, type Theme } from './tokens';

export type ThemeOverride = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  override: ThemeOverride;
  setOverride: (next: ThemeOverride) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useSetting<ThemeOverride>('theme', 'system');
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const resolved =
      override === 'system' ? (systemScheme ?? 'light') : override;
    return {
      theme: resolved === 'dark' ? darkTheme : lightTheme,
      override,
      setOverride,
    };
  }, [override, systemScheme, setOverride]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used inside <ThemeProvider>');
  return { override: ctx.override, setOverride: ctx.setOverride };
}
