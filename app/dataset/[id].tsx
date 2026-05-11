import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ExternalLink } from 'lucide-react-native';
import { Dimensions, Linking, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Badge, Card, ScreenScroll, Skeleton, Stack, Tap, Text } from '@/components/ui';
import { findDataset, TONE_COLOR, TONE_GLOW } from '@/features/insights/catalogue';
import { formatNumber, formatPercent } from '@/lib/format';
import {
  useCurrencyHistoryQuery,
  useCurrencyLatestQuery,
  useFuelPriceLatestQuery,
  useInflationLatestQuery,
  useRidershipLatestQuery,
} from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - S.lg * 2 - S.lg * 2; // account for ScreenScroll + Card padding

export default function DatasetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const match = findDataset(id ?? '');

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
        <Header title="Not found" />
        <View style={{ padding: S.lg }}>
          <Text variant="body" tone="soft">
            Dataset “{id}” is not in the catalogue.
          </Text>
        </View>
      </View>
    );
  }

  const { dataset, category } = match;
  const tone = TONE_COLOR[category.tone](theme);
  const toneBg = TONE_GLOW[category.tone](theme);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
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
                  backgroundColor: toneBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <dataset.Icon size={22} color={tone} strokeWidth={2} />
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

          <DetailBody id={dataset.id} tone={tone} toneBg={toneBg} />

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
                  Linking.openURL(`https://data.gov.my/data-catalogue?id=${dataset.id}`).catch(() => {})
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

function DetailBody({ id, tone, toneBg }: { id: string; tone: string; toneBg: string }) {
  if (id === 'currency') return <CurrencyDetail tone={tone} toneBg={toneBg} />;
  if (id === 'fuelprice') return <FuelDetail tone={tone} toneBg={toneBg} />;
  if (id === 'ridership_headline') return <RidershipDetail tone={tone} toneBg={toneBg} />;
  if (id === 'cpi_headline') return <InflationDetail tone={tone} toneBg={toneBg} />;
  return <ComingSoon />;
}

function ComingSoon() {
  return (
    <Card variant="flat" padding={S.xl} radius={R.xl} style={{ marginTop: S.xxl, alignItems: 'center' }}>
      <Badge label="COMING SOON" tone="brand" />
      <Text variant="h2" style={{ marginTop: S.md, textAlign: 'center' }}>
        Chart in the works
      </Text>
      <Text variant="body" tone="soft" style={{ marginTop: S.sm, textAlign: 'center', maxWidth: 280 }}>
        We’re curating this dataset for a beautiful chart. Until then, you can open the source entry below.
      </Text>
    </Card>
  );
}

function HeroNumber({
  value,
  unit,
  delta,
  asOf,
  isLoading,
  isError,
}: {
  value?: string;
  unit?: string;
  delta?: { sign: 1 | -1 | 0; label: string };
  asOf?: string;
  isLoading: boolean;
  isError: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Card variant="flat" padding={S.lg} radius={R.xl} style={{ marginTop: S.xxl }}>
      {isLoading ? (
        <View>
          <Skeleton width={140} height={36} />
          <View style={{ height: S.sm }} />
          <Skeleton width={180} height={14} />
        </View>
      ) : isError || !value ? (
        <View>
          <Text variant="numeric" tone="muted">
            —
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: S.xs }}>
            Couldn’t load data
          </Text>
        </View>
      ) : (
        <View>
          <Stack direction="row" align="baseline" gap={S.sm}>
            <Text variant="numeric">{value}</Text>
            {unit ? (
              <Text variant="bodyMedium" tone="muted">
                {unit}
              </Text>
            ) : null}
          </Stack>
          <Stack direction="row" align="center" gap={S.xs} style={{ marginTop: S.xs }}>
            {delta && delta.sign !== 0 ? (
              delta.sign > 0 ? (
                <ArrowUpRight size={14} color={theme.semantic.success} strokeWidth={2.4} />
              ) : (
                <ArrowDownRight size={14} color={theme.semantic.danger} strokeWidth={2.4} />
              )
            ) : null}
            <Text variant="caption" tone="soft">
              {delta?.label ?? (asOf ? `As of ${asOf}` : '')}
            </Text>
          </Stack>
        </View>
      )}
    </Card>
  );
}

function CurrencyDetail({ tone, toneBg }: { tone: string; toneBg: string }) {
  const { theme } = useTheme();
  const latest = useCurrencyLatestQuery('usd');
  const history = useCurrencyHistoryQuery('usd', 30);

  const chartData = (history.data ?? []).map((p) => ({ value: p.rate, label: '' }));

  const delta = latest.data?.delta;
  const deltaLabel =
    delta != null
      ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)} vs prev · ${latest.data?.asOf ?? ''}`
      : latest.data?.asOf
        ? `As of ${latest.data.asOf}`
        : '';

  return (
    <>
      <HeroNumber
        value={latest.data ? latest.data.rate.toFixed(4) : undefined}
        unit={latest.data ? latest.data.pair : 'MYR/USD'}
        delta={delta != null ? { sign: delta > 0 ? 1 : delta < 0 ? -1 : 0, label: deltaLabel } : undefined}
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
      />

      <Card variant="flat" padding={S.md} radius={R.xl} style={{ marginTop: S.md, overflow: 'hidden' }}>
        <Stack direction="row" align="center" gap={S.sm} style={{ paddingHorizontal: S.sm }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: R.pill,
              backgroundColor: tone,
            }}
          />
          <Text variant="caption" tone="soft">
            Last 30 days
          </Text>
        </Stack>
        {history.isLoading ? (
          <View style={{ height: 200, justifyContent: 'center', paddingHorizontal: S.sm, marginTop: S.sm }}>
            <Skeleton width="100%" height={180} radius={R.lg} />
          </View>
        ) : history.isError || chartData.length === 0 ? (
          <Text variant="body" tone="muted" style={{ marginTop: S.md, textAlign: 'center' }}>
            History not available right now.
          </Text>
        ) : (
          <View style={{ marginTop: S.sm, marginLeft: -S.xs }}>
            <LineChart
              data={chartData}
              width={CHART_WIDTH}
              height={180}
              hideDataPoints
              curved
              color={tone}
              startFillColor={tone}
              endFillColor={tone}
              startOpacity={0.25}
              endOpacity={0}
              areaChart
              thickness={2}
              hideRules
              yAxisColor="transparent"
              xAxisColor={theme.border}
              yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
              noOfSections={3}
              initialSpacing={0}
              spacing={(CHART_WIDTH - 12) / Math.max(chartData.length - 1, 1)}
            />
          </View>
        )}
      </Card>
    </>
  );
}

function FuelDetail({ tone, toneBg }: { tone: string; toneBg: string }) {
  const { theme } = useTheme();
  const q = useFuelPriceLatestQuery();
  const ron95 = q.data?.ron95;

  return (
    <HeroNumber
      value={ron95 != null ? `RM ${ron95.toFixed(2)}` : undefined}
      unit="RON95 / litre"
      asOf={q.data?.asOf}
      isLoading={q.isLoading}
      isError={q.isError}
    />
  );
}

function RidershipDetail({ tone, toneBg }: { tone: string; toneBg: string }) {
  const q = useRidershipLatestQuery();
  return (
    <HeroNumber
      value={q.data ? formatNumber(q.data.totalRail) : undefined}
      unit="rail trips"
      asOf={q.data?.asOf}
      isLoading={q.isLoading}
      isError={q.isError}
    />
  );
}

function InflationDetail({ tone, toneBg }: { tone: string; toneBg: string }) {
  const q = useInflationLatestQuery();
  return (
    <HeroNumber
      value={q.data ? formatPercent(q.data.yoy / 100) : undefined}
      unit="year-on-year"
      asOf={q.data?.asOf}
      isLoading={q.isLoading}
      isError={q.isError}
    />
  );
}
