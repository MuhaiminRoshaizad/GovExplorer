import type { TextStyle } from 'react-native';

export const fontFamily = {
  jakarta300: 'PlusJakartaSans_300Light',
  jakarta400: 'PlusJakartaSans_400Regular',
  jakarta500: 'PlusJakartaSans_500Medium',
  jakarta600: 'PlusJakartaSans_600SemiBold',
  jakarta700: 'PlusJakartaSans_700Bold',
  jakarta800: 'PlusJakartaSans_800ExtraBold',
} as const;

export const type: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamily.jakarta300,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  hero: {
    fontFamily: fontFamily.jakarta700,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: fontFamily.jakarta700,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: fontFamily.jakarta600,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fontFamily.jakarta600,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamily.jakarta400,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.jakarta400,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: fontFamily.jakarta500,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: fontFamily.jakarta600,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.jakarta500,
    fontSize: 12,
    lineHeight: 16,
  },
  micro: {
    fontFamily: fontFamily.jakarta700,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  numeric: {
    fontFamily: fontFamily.jakarta300,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
};

export type TypeVariant = keyof typeof type;
