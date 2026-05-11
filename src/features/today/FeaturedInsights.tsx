import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Card, Stack, Tap, Text } from '@/components/ui';
import { CATEGORIES, TONE_COLOR, TONE_GLOW } from '@/features/insights/catalogue';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const FEATURED_IDS = [
  'gdp_qtr_nominal',
  'lfs_month',
  'population_state',
  'exchangerates_daily_1700',
  'fuelprice',
];

export function FeaturedInsights() {
  const { theme } = useTheme();
  const featured = FEATURED_IDS.map((id) => {
    for (const cat of CATEGORIES) {
      const d = cat.datasets.find((x) => x.id === id);
      if (d) return { dataset: d, category: cat };
    }
    return null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <View style={{ marginTop: S.xl }}>
      <Stack direction="row" align="center" justify="space-between" style={{ paddingLeft: S.xs }}>
        <Text variant="micro" tone="muted">
          FEATURED INSIGHTS
        </Text>
        <Tap
          haptic="selection"
          onPress={() => router.navigate('/(tabs)/insights' as never)}
        >
          <Stack direction="row" align="center" gap={2}>
            <Text variant="caption" tone="soft">
              See all
            </Text>
            <ChevronRight size={14} color={theme.textSoft} strokeWidth={2} />
          </Stack>
        </Tap>
      </Stack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -S.lg, marginTop: S.sm }}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.md }}
      >
        {featured.map(({ dataset, category }) => {
          const fg = TONE_COLOR[category.tone](theme);
          const bg = TONE_GLOW[category.tone](theme);
          const Icon = dataset.Icon;
          return (
            <Tap
              key={dataset.id}
              haptic="light"
              onPress={() => router.push(`/dataset/${dataset.id}` as never)}
            >
              <Card variant="flat" padding={S.lg} radius={R.xl} style={{ width: 180, height: 152 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: R.md,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={fg} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text variant="caption" tone="muted">
                    {dataset.agency} · {dataset.cadence}
                  </Text>
                  <Text variant="h3" numberOfLines={2} style={{ marginTop: 2 }}>
                    {dataset.name}
                  </Text>
                </View>
              </Card>
            </Tap>
          );
        })}
      </ScrollView>
    </View>
  );
}
