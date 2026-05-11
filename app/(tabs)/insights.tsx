import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { ScreenScroll, Text } from '@/components/ui';
import { CategorySection } from '@/features/insights/CategorySection';
import { CATEGORIES } from '@/features/insights/catalogue';
import { useI18n } from '@/i18n';
import { S } from '@/theme';

export default function Insights() {
  const { t } = useI18n();

  return (
    <ScreenScroll>
      <ScreenEnter>
        <View style={{ marginTop: S.md }}>
          <Text variant="hero">{t.insights.title}</Text>
          <Text variant="bodyLg" tone="soft" style={{ marginTop: S.xs }}>
            {t.insights.subtitle}
          </Text>
        </View>

        {CATEGORIES.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}
      </ScreenEnter>
    </ScreenScroll>
  );
}
