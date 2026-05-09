export const fonts = {
  display: 'PlusJakartaSans_700Bold',
  displayHeavy: 'PlusJakartaSans_800ExtraBold',
  body: undefined as string | undefined, // system default
  mono: undefined as string | undefined, // system default mono
};

export const fontSize = {
  screenTitle: 28,
  hero: 22,
  sectionHead: 18,
  body: 14,
  label: 12,
  monoCaps: 11,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
