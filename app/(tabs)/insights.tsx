import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { ScreenScroll, Text } from '@/components/ui';
import { CATEGORIES, type Cadence } from '@/features/insights/catalogue';
import { CategorySection } from '@/features/insights/CategorySection';
import { FilterChips } from '@/features/insights/FilterChips';
import { useI18n } from '@/i18n';
import { S } from '@/theme';

export default function Insights() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Cadence | null>(null);

  const filtered = useMemo(() => {
    if (!filter) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      datasets: cat.datasets.filter((d) => d.cadence === filter),
    })).filter((cat) => cat.datasets.length > 0);
  }, [filter]);

  return (
    <ScreenScroll>
      <ScreenEnter>
        <View style={{ marginTop: S.md }}>
          <Text variant="hero">{t.insights.title}</Text>
          <Text variant="bodyLg" tone="soft" style={{ marginTop: S.xs }}>
            {t.insights.subtitle}
          </Text>
        </View>

        <FilterChips active={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <View style={{ marginTop: S.xxl, alignItems: 'center', padding: S.xl }}>
            <Text variant="body" tone="muted">
              No datasets with this cadence.
            </Text>
          </View>
        ) : (
          filtered.map((category) => <CategorySection key={category.key} category={category} />)
        )}
      </ScreenEnter>
    </ScreenScroll>
  );
}
