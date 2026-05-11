import { Activity } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Badge, Card, Stack, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

export function PulseHero({ valueLabel, deltaLabel }: { valueLabel: string; deltaLabel: string }) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 900, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.4 - pulse.value,
  }));

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  useEffect(() => {
    opacity.value = withDelay(120, withTiming(1, { duration: Motion.duration.slow }));
    translateY.value = withDelay(120, withTiming(0, { duration: Motion.duration.slow }));
  }, [opacity, translateY]);
  const entering = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={entering}>
      <Card variant="elevated" padding={S.xl} radius={R.xxl}>
        <Stack direction="row" align="center" justify="space-between">
          <Stack direction="row" align="center" gap={S.sm}>
            <View style={{ width: 10, height: 10, justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    borderRadius: R.pill,
                    backgroundColor: theme.semantic.success,
                  },
                  dotStyle,
                ]}
              />
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: R.pill,
                  backgroundColor: theme.semantic.success,
                }}
              />
            </View>
            <Text variant="micro" tone="soft">
              {t.today.pulseTitle}
            </Text>
          </Stack>
          <Badge label="LIVE" tone="success" />
        </Stack>

        <View style={{ marginTop: S.lg }}>
          <Text variant="numeric">{valueLabel}</Text>
          <Stack direction="row" align="center" gap={S.xs} style={{ marginTop: S.xs }}>
            <Activity size={14} color={theme.semantic.success} strokeWidth={2.4} />
            <Text variant="bodyMedium" tone="success">
              {deltaLabel}
            </Text>
          </Stack>
        </View>
      </Card>
    </Animated.View>
  );
}
