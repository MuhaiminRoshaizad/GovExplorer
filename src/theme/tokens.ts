import { fonts, fontSize, fontWeight } from './typography';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
const radius = { sm: 8, md: 12, lg: 16, xl: 18, pill: 999 } as const;

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  codeBg: string;
  codeText: string;
}

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    bg: '#FBFAF7',
    bgAlt: '#F4F2EC',
    surface: '#FFFFFF',
    text: '#14181F',
    textMuted: '#5C6573',
    border: '#E8E5DD',
    primary: '#1E3A5F',
    primarySoft: '#E6ECF4',
    accent: '#B45309',
    accentSoft: '#FBEFD9',
    success: '#15803D',
    danger: '#B91C1C',
    codeBg: '#0B1220',
    codeText: '#D6DEEC',
  },
  spacing, radius, fonts, fontSize, fontWeight,
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    bg: '#0E1014',
    bgAlt: '#15181F',
    surface: '#181B22',
    text: '#F2F0EB',
    textMuted: '#8B92A1',
    border: '#232730',
    primary: '#7BA7D9',
    primarySoft: '#1A2434',
    accent: '#F59E0B',
    accentSoft: '#2A1F0E',
    success: '#22C55E',
    danger: '#EF4444',
    codeBg: '#0B1220',
    codeText: '#D6DEEC',
  },
  spacing, radius, fonts, fontSize, fontWeight,
};
