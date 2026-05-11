import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type, type TypeVariant } from '@/theme';
import { useTheme } from '@/theme';

type Tone = 'default' | 'soft' | 'muted' | 'accent' | 'brand' | 'inverse' | 'danger' | 'success' | 'gold';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
};

export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const { theme } = useTheme();
  const color =
    tone === 'soft'
      ? theme.textSoft
      : tone === 'muted'
        ? theme.textMuted
        : tone === 'accent'
          ? theme.accent.base
          : tone === 'brand'
            ? theme.brand.base
            : tone === 'inverse'
              ? theme.mode === 'dark'
                ? theme.bg
                : theme.surface
              : tone === 'danger'
                ? theme.semantic.danger
                : tone === 'success'
                  ? theme.semantic.success
                  : tone === 'gold'
                    ? theme.gold.base
                    : theme.text;

  return <RNText {...rest} style={[type[variant], { color }, style]} />;
}
