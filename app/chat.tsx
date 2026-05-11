import { router } from 'expo-router';
import { ArrowUp, Sparkles, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card, Stack, Tap, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

export default function ChatScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const glow = useSharedValue(1);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 1400, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: 1.5 - glow.value,
  }));

  const samples = [t.chat.sampleQuestion1, t.chat.sampleQuestion2, t.chat.sampleQuestion3];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        style={{ paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm }}
      >
        <View style={{ width: 36 }} />
        <Text variant="bodyBold">{t.chat.title}</Text>
        <Tap haptic="selection" onPress={() => router.back()}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: R.pill,
              backgroundColor: theme.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={theme.text} strokeWidth={2} />
          </View>
        </Tap>
      </Stack>

      <View style={{ flex: 1, paddingHorizontal: S.xl, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 96,
              height: 96,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: S.xl,
            }}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 96,
                  height: 96,
                  borderRadius: R.pill,
                  backgroundColor: theme.accent.glow,
                },
                glowStyle,
              ]}
            />
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: R.pill,
                backgroundColor: theme.accent.base,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.accent.base,
                shadowOpacity: 0.35,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              }}
            >
              <Sparkles size={30} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>

          <Badge label={t.chat.comingSoon} tone="accent" />
          <Text variant="hero" style={{ marginTop: S.md, textAlign: 'center' }}>
            {t.chat.title}
          </Text>
          <Text
            variant="bodyLg"
            tone="soft"
            style={{ marginTop: S.sm, textAlign: 'center', maxWidth: 320 }}
          >
            {t.chat.description}
          </Text>
        </View>

        <Stack gap={S.sm} style={{ marginTop: S.xxxl }}>
          {samples.map((q, i) => (
            <Animated.View key={q} entering={FadeInDown.delay(180 + i * 80).duration(320)}>
              <Card variant="outline" padding={S.md} radius={R.lg}>
                <Stack direction="row" align="center" gap={S.sm}>
                  <Sparkles size={14} color={theme.textMuted} strokeWidth={1.8} />
                  <Text variant="body" tone="soft" style={{ flex: 1 }}>
                    {q}
                  </Text>
                </Stack>
              </Card>
            </Animated.View>
          ))}
        </Stack>
      </View>

      <View
        style={{
          paddingHorizontal: S.lg,
          paddingBottom: insets.bottom + S.md,
          paddingTop: S.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: R.pill,
            paddingLeft: S.lg,
            paddingRight: S.xs,
            paddingVertical: S.xs,
            borderWidth: 1,
            borderColor: theme.border,
            opacity: 0.55,
          }}
        >
          <Text variant="body" tone="muted" style={{ flex: 1 }}>
            {t.chat.placeholder}
          </Text>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: R.pill,
              backgroundColor: theme.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUp size={18} color={theme.textMuted} strokeWidth={2} />
          </View>
        </View>
      </View>
    </View>
  );
}
