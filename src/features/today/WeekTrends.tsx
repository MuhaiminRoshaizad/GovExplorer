import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Card, Skeleton, Stack, Tap, Text } from '@/components/ui';
import { formatCompact, formatPercent } from '@/lib/format';
import {
  useFuelPriceHistoryQuery,
  useInflationHistoryQuery,
  useRidershipHistoryQuery,
} from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const CARD_W = 220;
const CHART_H = 60;

export function WeekTrends() {
  return (
    <View style={{ marginTop: S.xl }}>
      <Text variant="micro" tone="muted" style={{ paddingLeft: S.xs, marginBottom: S.sm }}>
        THIS WEEK
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -S.lg }}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.md }}
      >
        <InflationTrend />
        <RidershipTrend />
        <FuelTrend />
      </ScrollView>
    </View>
  );
}

function InflationTrend() {
  const { theme } = useTheme();
  const q = useInflationHistoryQuery(12);
  const data = (q.data ?? []).map((p) => ({ value: p.yoy }));
  const latest = data[data.length - 1]?.value;
  return (
    <TrendCard
      label="CPI inflation · 12m"
      value={latest != null ? formatPercent(latest / 100) : undefined}
      isLoading={q.isLoading}
      isError={q.isError}
      onPress={() => router.push('/dataset/cpi_headline' as never)}
    >
      {data.length > 0 ? (
        <LineChart
          data={data}
          width={CARD_W - S.lg * 2}
          height={CHART_H}
          hideDataPoints
          curved
          color={theme.gold.base}
          startFillColor={theme.gold.base}
          endFillColor={theme.gold.base}
          startOpacity={0.3}
          endOpacity={0}
          areaChart
          thickness={1.5}
          hideRules
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisLabelWidth={0}
          hideYAxisText
          noOfSections={1}
          initialSpacing={0}
          spacing={(CARD_W - S.lg * 2) / Math.max(data.length - 1, 1)}
          adjustToWidth
        />
      ) : null}
    </TrendCard>
  );
}

function RidershipTrend() {
  const { theme } = useTheme();
  const q = useRidershipHistoryQuery(14);
  const data = (q.data ?? []).map((p) => ({ value: p.total }));
  const latest = data[data.length - 1]?.value;
  return (
    <TrendCard
      label="Rail trips · 14d"
      value={latest != null ? formatCompact(latest) : undefined}
      isLoading={q.isLoading}
      isError={q.isError}
      onPress={() => router.push('/dataset/ridership_headline' as never)}
    >
      {data.length > 0 ? (
        <LineChart
          data={data}
          width={CARD_W - S.lg * 2}
          height={CHART_H}
          hideDataPoints
          curved
          color={theme.chart.blue}
          startFillColor={theme.chart.blue}
          endFillColor={theme.chart.blue}
          startOpacity={0.3}
          endOpacity={0}
          areaChart
          thickness={1.5}
          hideRules
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisLabelWidth={0}
          hideYAxisText
          noOfSections={1}
          initialSpacing={0}
          spacing={(CARD_W - S.lg * 2) / Math.max(data.length - 1, 1)}
          adjustToWidth
        />
      ) : null}
    </TrendCard>
  );
}

function FuelTrend() {
  const { theme } = useTheme();
  const q = useFuelPriceHistoryQuery(12);
  const data = (q.data ?? []).map((p) => ({ value: p.ron95 }));
  const latest = data[data.length - 1]?.value;
  return (
    <TrendCard
      label="RON95 · 12 weeks"
      value={latest != null ? `RM ${latest.toFixed(2)}` : undefined}
      isLoading={q.isLoading}
      isError={q.isError}
      onPress={() => router.push('/dataset/fuelprice' as never)}
    >
      {data.length > 0 ? (
        <LineChart
          data={data}
          width={CARD_W - S.lg * 2}
          height={CHART_H}
          hideDataPoints
          curved
          color={theme.chart.teal}
          startFillColor={theme.chart.teal}
          endFillColor={theme.chart.teal}
          startOpacity={0.3}
          endOpacity={0}
          areaChart
          thickness={1.5}
          hideRules
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisLabelWidth={0}
          hideYAxisText
          noOfSections={1}
          initialSpacing={0}
          spacing={(CARD_W - S.lg * 2) / Math.max(data.length - 1, 1)}
          adjustToWidth
        />
      ) : null}
    </TrendCard>
  );
}

function TrendCard({
  label,
  value,
  isLoading,
  isError,
  onPress,
  children,
}: {
  label: string;
  value?: string;
  isLoading: boolean;
  isError: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tap haptic="light" onPress={onPress}>
      <Card variant="flat" padding={S.lg} radius={R.xl} style={{ width: CARD_W, height: 140 }}>
        <Stack gap={S.xs}>
          <Text variant="caption" tone="muted">
            {label}
          </Text>
          {isLoading ? (
            <Skeleton width={100} height={22} />
          ) : isError ? (
            <Text variant="h2" tone="muted">
              —
            </Text>
          ) : (
            <Text variant="h2">{value ?? '—'}</Text>
          )}
        </Stack>
        <View style={{ marginTop: 'auto', marginLeft: -S.sm }}>{children}</View>
      </Card>
    </Tap>
  );
}
