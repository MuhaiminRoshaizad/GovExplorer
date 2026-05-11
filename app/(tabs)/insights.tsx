import { ChevronRight, Cloud, LineChart, TrendingUp, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

type Category = {
  key: 'economy' | 'transit' | 'climate' | 'society';
  Icon: LucideIcon;
  tone: 'gold' | 'chart-blue' | 'chart-teal' | 'accent';
  count: number;
};

const CATEGORIES: Category[] = [
  { key: 'economy', Icon: TrendingUp, tone: 'gold', count: 8 },
  { key: 'transit', Icon: LineChart, tone: 'chart-blue', count: 5 },
  { key: 'climate', Icon: Cloud, tone: 'chart-teal', count: 6 },
  { key: 'society', Icon: Users, tone: 'accent', count: 7 },
];

const TONE_BG: Record<Category['tone'], (t: ReturnType<typeof useTheme>['theme']) => { bg: string; fg: string }> = {
  gold: (t) => ({ bg: t.gold.glow, fg: t.gold.base }),
  'chart-blue': (t) => ({ bg: 'rgba(59,111,168,0.14)', fg: t.chart.blue }),
  'chart-teal': (t) => ({ bg: 'rgba(62,142,132,0.14)', fg: t.chart.teal }),
  accent: (t) => ({ bg: t.accent.glow, fg: t.accent.base }),
};

export default function Insights() {
  const { t } = useI18n();
  const { theme } = useTheme();

  return (
    <ScreenScroll>
      <ScreenEnter>
      <View style={{ marginTop: S.md }}>
        <Text variant="hero">{t.insights.title}</Text>
        <Text variant="bodyLg" tone="soft" style={{ marginTop: S.xs }}>
          {t.insights.subtitle}
        </Text>
      </View>

      <Stack gap={S.md} style={{ marginTop: S.xl }}>
        {CATEGORIES.map((c) => {
          const colors = TONE_BG[c.tone](theme);
          const label = t.insights[c.key];
          return (
            <Tap key={c.key} haptic="light">
              <Card variant="flat" padding={S.lg} radius={R.xl}>
                <Stack direction="row" align="center" gap={S.md}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: R.lg,
                      backgroundColor: colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <c.Icon size={20} color={colors.fg} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3">{label}</Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                      {c.count} datasets
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.textMuted} strokeWidth={1.8} />
                </Stack>
              </Card>
            </Tap>
          );
        })}
      </Stack>
      </ScreenEnter>
    </ScreenScroll>
  );
}
