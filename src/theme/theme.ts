import { palette } from './palette';

export type Mode = 'light' | 'dark';

export type Theme = {
  mode: Mode;
  brand: typeof palette.brand;
  accent: typeof palette.accent;
  gold: typeof palette.gold;
  chart: typeof palette.chart;
  semantic: typeof palette.semantic;
  bg: string;
  surface: string;
  surfaceMuted: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  text: string;
  textSoft: string;
  textMuted: string;
  overlay: string;
};

const shared = {
  brand: palette.brand,
  accent: palette.accent,
  gold: palette.gold,
  chart: palette.chart,
  semantic: palette.semantic,
};

export const lightTheme: Theme = {
  mode: 'light',
  ...shared,
  ...palette.light,
};

export const darkTheme: Theme = {
  mode: 'dark',
  ...shared,
  ...palette.dark,
};
