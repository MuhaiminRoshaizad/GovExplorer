import { Compass } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge, Card, Screen, Stack, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

export default function Explore() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Screen>
      <View style={{ marginTop: S.md }}>
        <Badge label="COMING SOON" tone="brand" />
        <Text variant="hero" style={{ marginTop: S.sm }}>
          {t.explore.title}
        </Text>
        <Text variant="bodyLg" tone="soft" style={{ marginTop: S.xs }}>
          {t.explore.subtitle}
        </Text>
      </View>

      <Card
        variant="flat"
        padding={S.xxl}
        radius={R.xxl}
        style={{ marginTop: S.xl, alignItems: 'center', justifyContent: 'center', minHeight: 360 }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: R.pill,
            backgroundColor: theme.brand.glow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Compass size={32} color={theme.brand.base} strokeWidth={1.8} />
        </View>
        <Text variant="h2" style={{ marginTop: S.lg, textAlign: 'center' }}>
          Interactive map of Malaysia
        </Text>
        <Text variant="body" tone="soft" style={{ marginTop: S.sm, textAlign: 'center', maxWidth: 280 }}>
          A topo of 13 states + 3 federal territories. Tap one to dive in — climate, economy, mobility, people.
        </Text>
        <Stack direction="row" gap={S.xs} style={{ marginTop: S.lg }}>
          <Badge label="SVG TOPO" />
          <Badge label="13 STATES" />
          <Badge label="REANIMATED" />
        </Stack>
      </Card>
    </Screen>
  );
}
