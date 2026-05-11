export const palette = {
  brand: {
    deep: '#142A47',
    base: '#1B365D',
    soft: '#2E5077',
    muted: '#0F2237',
    glow: 'rgba(27, 54, 93, 0.18)',
  },
  accent: {
    base: '#E63946',
    soft: '#F4A6AB',
    glow: 'rgba(230, 57, 70, 0.16)',
  },
  gold: {
    base: '#C8993A',
    soft: '#E6C57A',
    glow: 'rgba(200, 153, 58, 0.18)',
  },
  chart: {
    blue: '#3B6FA8',
    coral: '#E26D5C',
    teal: '#3E8E84',
    gold: '#C8993A',
    plum: '#7E5A8C',
    sage: '#7A8C5E',
  },
  semantic: {
    success: '#2E8B57',
    warning: '#E0A431',
    danger: '#C8323A',
    info: '#3B6FA8',
  },
  light: {
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F2EFE8',
    surfaceSunken: '#EDE9E0',
    border: '#E5E1D6',
    borderStrong: '#CFC9BB',
    text: '#16140F',
    textSoft: '#564F44',
    textMuted: '#8A8275',
    overlay: 'rgba(22, 20, 15, 0.45)',
  },
  dark: {
    bg: '#0A0D13',
    surface: '#141821',
    surfaceMuted: '#1B202B',
    surfaceSunken: '#080B11',
    border: '#252B37',
    borderStrong: '#3A4151',
    text: '#ECE8DE',
    textSoft: '#A39E91',
    textMuted: '#6A6457',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type Palette = typeof palette;
