export const S = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  mega: 64,
} as const;

export const R = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

export const TAB_BAR_CLEARANCE = 110;

export const Z = {
  base: 0,
  card: 1,
  sheet: 10,
  modal: 20,
  toast: 30,
} as const;

export const Motion = {
  duration: {
    instant: 120,
    fast: 200,
    base: 280,
    slow: 420,
    storyteller: 640,
  },
  spring: {
    soft: { damping: 18, stiffness: 160, mass: 1 },
    snappy: { damping: 14, stiffness: 220, mass: 0.9 },
    bouncy: { damping: 9, stiffness: 180, mass: 0.9 },
  },
} as const;
