import { ArrowUpRight } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge, Card, Stack, Tap, Text } from '@/components/ui';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { TONE_COLOR, TONE_GLOW, type CategoryTone, type Dataset } from './catalogue';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 160;

type Props = {
  dataset: Dataset;
  tone: CategoryTone;
  onPress: () => void;
};

export function DatasetCard({ dataset, tone, onPress }: Props) {
  const { theme } = useTheme();
  const fg = TONE_COLOR[tone](theme);
  const bg = TONE_GLOW[tone](theme);
  const Icon = dataset.Icon;

  return (
    <Tap haptic="light" onPress={onPress}>
      <Card variant="flat" padding={S.lg} radius={R.xl} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        <Stack direction="row" align="center" justify="space-between">
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
          {dataset.wired ? (
            <ArrowUpRight size={16} color={theme.textMuted} strokeWidth={1.6} />
          ) : (
            <Badge label="SOON" tone="neutral" />
          )}
        </Stack>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Text variant="h3" numberOfLines={2}>
            {dataset.name}
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: S.xxs }}>
            {dataset.agency} · {dataset.cadence}
          </Text>
        </View>
      </Card>
    </Tap>
  );
}
