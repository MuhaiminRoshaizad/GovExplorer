import { Flame } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Stack, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

function pickGreeting(t: ReturnType<typeof useI18n>['t']) {
  const hour = new Date().getHours();
  if (hour < 12) return t.today.greetingMorning;
  if (hour < 18) return t.today.greetingAfternoon;
  return t.today.greetingEvening;
}

export function Greeting({ streak }: { streak: number }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const greet = pickGreeting(t);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: Motion.duration.slow });
    translateY.value = withTiming(0, { duration: Motion.duration.slow });
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Stack direction="row" align="center" justify="space-between">
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            {greet}
          </Text>
          <Text variant="hero" style={{ marginTop: 2 }}>
            Malaysia, today.
          </Text>
        </View>
        {streak > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: S.xs,
              backgroundColor: theme.gold.glow,
              borderRadius: R.pill,
              paddingHorizontal: S.md,
              paddingVertical: S.xs + 2,
            }}
          >
            <Flame size={14} color={theme.gold.base} strokeWidth={2.4} />
            <Text variant="bodyBold" tone="gold">
              {streak}
            </Text>
            <Text variant="caption" tone="gold" style={{ marginLeft: -2 }}>
              {t.today.streakLabel}
            </Text>
          </View>
        ) : null}
      </Stack>
    </Animated.View>
  );
}
