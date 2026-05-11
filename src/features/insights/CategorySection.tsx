import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Stack, Text } from '@/components/ui';
import { S } from '@/theme';
import { useTheme } from '@/theme';

import type { Category } from './catalogue';
import { TONE_COLOR, TONE_GLOW } from './catalogue';
import { DatasetCard } from './DatasetCard';

type Props = {
  category: Category;
};

export function CategorySection({ category }: Props) {
  const { theme } = useTheme();
  const fg = TONE_COLOR[category.tone](theme);
  const bg = TONE_GLOW[category.tone](theme);
  const Icon = category.Icon;

  return (
    <View style={{ marginTop: S.xxl }}>
      <Stack direction="row" align="center" gap={S.sm}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={fg} strokeWidth={2} />
        </View>
        <Text variant="h2" style={{ flex: 1 }}>
          {category.label}
        </Text>
        <Text variant="caption" tone="muted">
          {category.datasets.length}
        </Text>
      </Stack>

      <FlatList
        horizontal
        data={category.datasets}
        keyExtractor={(d) => d.id}
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -S.lg, marginTop: S.md }}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.md }}
        renderItem={({ item }) => (
          <DatasetCard
            dataset={item}
            tone={category.tone}
            onPress={() => router.push(`/dataset/${item.id}` as never)}
          />
        )}
      />
    </View>
  );
}
