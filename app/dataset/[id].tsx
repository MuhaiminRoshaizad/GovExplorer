import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import { Linking, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Badge, Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { findDataset, TONE_COLOR, TONE_GLOW } from '@/features/insights/catalogue';
import {
  ComingSoonDetail,
  CurrencyDetail,
  FuelDetail,
  GdpDetail,
  InflationDetail,
  PopulationDetail,
  RidershipDetail,
  UnemploymentDetail,
} from '@/features/insights/details';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const DETAIL_BY_ID: Record<string, React.ComponentType<{ tone: { color: string; bg: string } }>> = {
  exchangerates_daily_1700: CurrencyDetail,
  fuelprice: FuelDetail,
  cpi_headline: InflationDetail,
  gdp_qtr_nominal: GdpDetail,
  ridership_headline: RidershipDetail,
  lfs_month: UnemploymentDetail,
  population_state: PopulationDetail,
};

export default function DatasetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const match = findDataset(id ?? '');

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
        <RouterStack.Screen options={{ animation: 'slide_from_right' }} />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <View style={{ paddingHorizontal: S.lg, paddingBottom: S.sm }}>
          <Header title="Not found" />
        </View>
        <View style={{ padding: S.lg }}>
          <Text variant="body" tone="soft">
            Dataset “{id}” is not in the catalogue.
          </Text>
        </View>
      </View>
    );
  }

  const { dataset, category } = match;
  const tone = {
    color: TONE_COLOR[category.tone](theme),
    bg: TONE_GLOW[category.tone](theme),
  };

  const Body = DETAIL_BY_ID[dataset.id];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <RouterStack.Screen options={{ animation: 'slide_from_right' }} />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingTop: insets.top, paddingHorizontal: S.lg, paddingBottom: S.sm }}>
        <Header title={dataset.agency} />
      </View>

      <ScreenScroll paddingHorizontal={S.lg}>
        <ScreenEnter>
          <View style={{ marginTop: S.sm }}>
            <Stack direction="row" align="center" gap={S.sm}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: R.lg,
                  backgroundColor: tone.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <dataset.Icon size={22} color={tone.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="muted">
                  {dataset.agency} · {dataset.cadence}
                </Text>
                <Text variant="hero">{dataset.name}</Text>
              </View>
            </Stack>
            <Text variant="bodyLg" tone="soft" style={{ marginTop: S.lg }}>
              {dataset.description}
            </Text>
          </View>

          {Body ? <Body tone={tone} /> : <ComingSoonDetail />}

          <Card variant="outline" padding={S.lg} radius={R.xl} style={{ marginTop: S.xxl }}>
            <Stack direction="row" align="center" gap={S.md}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: R.md,
                  backgroundColor: theme.brand.glow,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ExternalLink size={16} color={theme.brand.base} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">View on data.gov.my</Text>
                <Text variant="caption" tone="muted">
                  Open the source catalogue entry
                </Text>
              </View>
              <Tap
                haptic="light"
                onPress={() =>
                  Linking.openURL(`https://data.gov.my/data-catalogue/${dataset.id}`).catch(() => {})
                }
              >
                <Badge label="OPEN" tone="brand" />
              </Tap>
            </Stack>
          </Card>
        </ScreenEnter>
      </ScreenScroll>
    </View>
  );
}

function Header({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <Stack direction="row" align="center" justify="space-between">
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
          <ChevronLeft size={20} color={theme.text} strokeWidth={2} />
        </View>
      </Tap>
      <Text variant="bodyBold">{title}</Text>
      <View style={{ width: 36 }} />
    </Stack>
  );
}
