import type { TextStyle } from 'react-native';

export const fontFamily = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const type: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamily.light,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.8,
  },
  hero: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  micro: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  numeric: {
    fontFamily: fontFamily.light,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.6,
  },
};

export type TypeVariant = keyof typeof type;
