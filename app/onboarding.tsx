import { router } from 'expo-router';
import { ArrowRight, BarChart3, Map, Sparkles } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, Tap, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { storage, StorageKeys } from '@/lib/storage';
import { Motion, R, S } from '@/theme';
import { useTheme } from '@/theme';

const { width } = Dimensions.get('window');

type Slide = { key: string; title: string; body: string; Icon: LucideIcon; tone: 'brand' | 'accent' | 'gold' };

export default function Onboarding() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const slides: Slide[] = [
    { key: '1', title: t.onboarding.slide1Title, body: t.onboarding.slide1Body, Icon: Sparkles, tone: 'brand' },
    { key: '2', title: t.onboarding.slide2Title, body: t.onboarding.slide2Body, Icon: Map, tone: 'accent' },
    { key: '3', title: t.onboarding.slide3Title, body: t.onboarding.slide3Body, Icon: BarChart3, tone: 'gold' },
  ];

  const finish = async () => {
    await storage.setJSON(StorageKeys.onboarded, true);
    router.replace('/(tabs)');
  };

  const goNext = () => {
    if (index === slides.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <Stack direction="row" justify="flex-end" style={{ paddingHorizontal: S.lg, paddingTop: S.md }}>
        <Tap haptic="selection" onPress={finish}>
          <Text variant="bodyMedium" tone="soft" style={{ paddingHorizontal: S.md, paddingVertical: S.sm }}>
            {t.onboarding.skip}
          </Text>
        </Tap>
      </Stack>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => {
          const tones = {
            brand: { bg: theme.brand.glow, fg: theme.brand.base },
            accent: { bg: theme.accent.glow, fg: theme.accent.base },
            gold: { bg: theme.gold.glow, fg: theme.gold.base },
          };
          const c = tones[item.tone];
          return (
            <View style={{ width, paddingHorizontal: S.xxl, justifyContent: 'center' }}>
              <Animated.View entering={FadeIn.duration(Motion.duration.slow)}>
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: R.xxl,
                    backgroundColor: c.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: S.xxl,
                  }}
                >
                  <item.Icon size={42} color={c.fg} strokeWidth={1.6} />
                </View>
                <Text variant="display" style={{ fontSize: 36, lineHeight: 42 }}>
                  {item.title}
                </Text>
                <Text variant="bodyLg" tone="soft" style={{ marginTop: S.md }}>
                  {item.body}
                </Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={{ paddingHorizontal: S.xxl, paddingBottom: insets.bottom + S.xl }}>
        <Stack direction="row" gap={S.xs} justify="center" style={{ marginBottom: S.xl }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: R.pill,
                backgroundColor: i === index ? theme.brand.base : theme.border,
              }}
            />
          ))}
        </Stack>

        <Tap haptic="medium" onPress={goNext}>
          <View
            style={{
              backgroundColor: theme.brand.base,
              borderRadius: R.pill,
              paddingVertical: S.lg,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: S.sm,
            }}
          >
            <Text variant="bodyBold" tone="inverse">
              {index === slides.length - 1 ? t.onboarding.start : t.onboarding.next}
            </Text>
            <ArrowRight size={18} color={theme.mode === 'dark' ? theme.bg : theme.surface} strokeWidth={2.4} />
          </View>
        </Tap>
      </View>
    </View>
  );
}
