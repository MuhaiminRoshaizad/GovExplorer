import { View, type ViewProps } from 'react-native';

import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'brand' | 'accent' | 'gold' | 'success' | 'warning' | 'danger';

type Props = ViewProps & {
  label: string;
  tone?: Tone;
};

export function Badge({ label, tone = 'neutral', style, ...rest }: Props) {
  const { theme } = useTheme();
  const map: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: theme.surfaceMuted, fg: theme.textSoft },
    brand: { bg: theme.brand.glow, fg: theme.brand.base },
    accent: { bg: theme.accent.glow, fg: theme.accent.base },
    gold: { bg: theme.gold.glow, fg: theme.gold.base },
    success: { bg: 'rgba(46,139,87,0.12)', fg: theme.semantic.success },
    warning: { bg: 'rgba(224,164,49,0.14)', fg: theme.semantic.warning },
    danger: { bg: 'rgba(200,50,58,0.12)', fg: theme.semantic.danger },
  };
  const c = map[tone];
  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          paddingHorizontal: S.sm,
          paddingVertical: S.xxs + 2,
          borderRadius: R.pill,
          alignSelf: 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      <Text variant="micro" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}
