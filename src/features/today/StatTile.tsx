import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Card, Skeleton, Stack, Tap, Text } from '@/components/ui';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

type Tone = 'brand' | 'accent' | 'gold' | 'chart-blue' | 'chart-teal' | 'chart-coral';

const TONE_MAP: Record<Tone, (t: ReturnType<typeof useTheme>['theme']) => { bg: string; fg: string }> = {
  brand: (t) => ({ bg: t.brand.glow, fg: t.brand.base }),
  accent: (t) => ({ bg: t.accent.glow, fg: t.accent.base }),
  gold: (t) => ({ bg: t.gold.glow, fg: t.gold.base }),
  'chart-blue': (t) => ({ bg: 'rgba(59,111,168,0.14)', fg: t.chart.blue }),
  'chart-teal': (t) => ({ bg: 'rgba(62,142,132,0.14)', fg: t.chart.teal }),
  'chart-coral': (t) => ({ bg: 'rgba(226,109,92,0.14)', fg: t.chart.coral }),
};

type Props = {
  label: string;
  value?: string;
  unit?: string;
  Icon: LucideIcon;
  tone?: Tone;
  index?: number;
  isLoading?: boolean;
  isError?: boolean;
  onPress?: () => void;
};

export function StatTile({
  label,
  value,
  unit,
  Icon,
  tone = 'brand',
  index = 0,
  isLoading = false,
  isError = false,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const colors = TONE_MAP[tone](theme);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  useEffect(() => {
    const delay = 200 + index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: Motion.duration.base }));
    translateY.value = withDelay(delay, withTiming(0, { duration: Motion.duration.base }));
  }, [opacity, translateY, index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const displayValue = isError ? '—' : value ?? '';

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      <Tap onPress={onPress} haptic="light" style={{ flex: 1 }}>
        <Card variant="flat" padding={S.lg} style={{ flex: 1, minHeight: 124 }}>
          <Stack direction="row" align="center" justify="space-between">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: R.lg,
                backgroundColor: colors.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={16} color={colors.fg} strokeWidth={2.2} />
            </View>
          </Stack>
          <View style={{ marginTop: S.lg }}>
            {isLoading ? (
              <Skeleton width={72} height={26} />
            ) : (
              <Stack direction="row" align="baseline" gap={S.xs}>
                <Text variant="h1" tone={isError ? 'muted' : 'default'}>
                  {displayValue}
                </Text>
                {unit && !isError ? (
                  <Text variant="bodyMedium" tone="muted">
                    {unit}
                  </Text>
                ) : null}
              </Stack>
            )}
            <Text variant="caption" tone="soft" style={{ marginTop: S.xxs }}>
              {label}
            </Text>
          </View>
        </Card>
      </Tap>
    </Animated.View>
  );
}
