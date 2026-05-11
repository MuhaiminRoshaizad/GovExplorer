import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Card, Stack, Tap, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

export function SurpriseCard({ fact, source }: { fact: string; source: string }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);

  const rotation = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Tap
      haptic="medium"
      onPress={() => {
        rotation.value = withSpring(revealed ? 0 : 1.5, Motion.spring.bouncy, () => {
          rotation.value = withSpring(0, Motion.spring.bouncy);
        });
        setRevealed((r) => !r);
      }}
    >
      <Animated.View style={cardStyle}>
        <Card variant="flat" padding={S.lg} radius={R.xxl} style={{ backgroundColor: theme.accent.glow }}>
          <Stack direction="row" align="center" gap={S.sm}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: R.pill,
                backgroundColor: theme.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={14} color={theme.accent.base} strokeWidth={2.4} />
            </View>
            <Text variant="micro" tone="accent">
              {t.today.surpriseTitle}
            </Text>
          </Stack>

          {revealed ? (
            <Animated.View entering={FadeIn.duration(Motion.duration.base)} exiting={FadeOut.duration(120)}>
              <Text variant="h2" style={{ marginTop: S.md }}>
                {fact}
              </Text>
              <Text variant="caption" tone="muted" style={{ marginTop: S.xs }}>
                {source}
              </Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(Motion.duration.base)}>
              <Text variant="h2" tone="soft" style={{ marginTop: S.md }}>
                {t.today.surpriseTap}
              </Text>
            </Animated.View>
          )}
        </Card>
      </Animated.View>
    </Tap>
  );
}
