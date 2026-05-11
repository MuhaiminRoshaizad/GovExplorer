import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Dimensions, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { Badge, Card, Skeleton, Stack, Text } from '@/components/ui';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import {
  useCurrencyHistoryQuery,
  useCurrencyLatestQuery,
  useFuelPriceHistoryQuery,
  useFuelPriceLatestQuery,
  useGdpHistoryQuery,
  useGdpLatestQuery,
  useInflationHistoryQuery,
  useInflationLatestQuery,
  usePopulationLatestQuery,
  useRidershipHistoryQuery,
  useRidershipLatestQuery,
  useUnemploymentHistoryQuery,
  useUnemploymentLatestQuery,
} from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_INSET = S.lg * 2 + S.md * 2;
const CHART_WIDTH = SCREEN_WIDTH - CHART_INSET;

type Tone = { color: string; bg: string };

export type DetailProps = {
  tone: Tone;
};

// ─────────────────────────── Shared chrome ───────────────────────────

export function HeroNumber({
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
          <Skeleton width={160} height={36} />
          <View style={{ height: S.sm }} />
          <Skeleton width={200} height={14} />
        </View>
      ) : isError || !value ? (
        <View>
          <Text variant="numeric" tone="muted">
            —
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: S.xs }}>
            Couldn’t load this dataset
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

function ChartCard({
  title,
  children,
  isLoading,
  isError,
  empty,
}: {
  title: string;
  children: ReactNode;
  isLoading: boolean;
  isError: boolean;
  empty?: boolean;
}) {
  return (
    <Card variant="flat" padding={S.md} radius={R.xl} style={{ marginTop: S.md, overflow: 'hidden' }}>
      <Text variant="micro" tone="muted" style={{ paddingHorizontal: S.sm, paddingTop: S.xs }}>
        {title}
      </Text>
      {isLoading ? (
        <View style={{ paddingHorizontal: S.sm, paddingVertical: S.md }}>
          <Skeleton width="100%" height={180} radius={R.lg} />
        </View>
      ) : isError || empty ? (
        <Text variant="body" tone="muted" style={{ marginVertical: S.lg, textAlign: 'center' }}>
          History not available right now.
        </Text>
      ) : (
        <View style={{ marginTop: S.sm, marginLeft: -S.xs, paddingBottom: S.xs }}>{children}</View>
      )}
    </Card>
  );
}

// ─────────────────────────── Coming soon ───────────────────────────

export function ComingSoonDetail() {
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

// ─────────────────────────── Currency ───────────────────────────

export function CurrencyDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useCurrencyLatestQuery('usd');
  const history = useCurrencyHistoryQuery('usd', 30);

  const data = (history.data ?? []).map((p) => ({ value: p.rate, label: '' }));
  const yMin = data.length ? Math.min(...data.map((p) => p.value)) : 0;
  const yMax = data.length ? Math.max(...data.map((p) => p.value)) : 0;

  const delta = latest.data?.delta;
  const deltaLabel =
    delta != null
      ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)} vs prev day · as of ${latest.data?.asOf}`
      : latest.data?.asOf
        ? `As of ${latest.data.asOf}`
        : '';

  return (
    <>
      <HeroNumber
        value={latest.data ? latest.data.rate.toFixed(4) : undefined}
        unit={latest.data ? latest.data.pair : 'USD / MYR'}
        delta={delta != null ? { sign: delta > 0 ? 1 : delta < 0 ? -1 : 0, label: deltaLabel } : undefined}
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
      />
      <ChartCard
        title="Last 30 days"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={data.length === 0}
      >
        <LineChart
          data={data}
          width={CHART_WIDTH}
          height={180}
          hideDataPoints
          curved
          color={tone.color}
          startFillColor={tone.color}
          endFillColor={tone.color}
          startOpacity={0.25}
          endOpacity={0}
          areaChart
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          yAxisOffset={Math.max(0, yMin - (yMax - yMin) * 0.1)}
          noOfSections={3}
          initialSpacing={0}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(data.length - 1, 1))}
        />
      </ChartCard>
    </>
  );
}

// ─────────────────────────── Fuel ───────────────────────────

export function FuelDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useFuelPriceLatestQuery();
  const history = useFuelPriceHistoryQuery(26);

  const ron95Data = (history.data ?? []).map((p) => ({ value: p.ron95, label: '' }));
  const ron97Data = (history.data ?? []).map((p) => ({ value: p.ron97, label: '' }));
  const dieselData = (history.data ?? []).map((p) => ({ value: p.diesel, label: '' }));

  const delta = latest.data?.weeklyDeltaRon95;
  const deltaLabel =
    delta != null
      ? `RON95 ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} this week`
      : latest.data?.asOf
        ? `As of ${latest.data.asOf}`
        : '';

  return (
    <>
      <HeroNumber
        value={latest.data?.ron95 != null ? `RM ${latest.data.ron95.toFixed(2)}` : undefined}
        unit="RON95 / litre"
        delta={delta != null ? { sign: delta > 0 ? 1 : delta < 0 ? -1 : 0, label: deltaLabel } : undefined}
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
      />

      {latest.data ? (
        <Card variant="outline" padding={S.lg} radius={R.xl} style={{ marginTop: S.md }}>
          <Stack direction="row" justify="space-between">
            <Stack gap={S.xxs}>
              <Text variant="caption" tone="muted">
                RON97
              </Text>
              <Text variant="h2">RM {latest.data.ron97?.toFixed(2) ?? '—'}</Text>
            </Stack>
            <Stack gap={S.xxs}>
              <Text variant="caption" tone="muted">
                Diesel
              </Text>
              <Text variant="h2">RM {latest.data.diesel?.toFixed(2) ?? '—'}</Text>
            </Stack>
          </Stack>
        </Card>
      ) : null}

      <ChartCard
        title="Last 26 weeks"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={ron95Data.length === 0}
      >
        <LineChart
          data={ron95Data}
          data2={ron97Data}
          data3={dieselData}
          width={CHART_WIDTH}
          height={200}
          hideDataPoints
          curved
          color1={tone.color}
          color2={theme.chart.coral}
          color3={theme.chart.teal}
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          noOfSections={3}
          initialSpacing={4}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(ron95Data.length - 1, 1))}
        />
        <Stack direction="row" gap={S.md} style={{ paddingHorizontal: S.sm, marginTop: S.sm }}>
          <LegendDot color={tone.color} label="RON95" />
          <LegendDot color={theme.chart.coral} label="RON97" />
          <LegendDot color={theme.chart.teal} label="Diesel" />
        </Stack>
      </ChartCard>
    </>
  );
}

// ─────────────────────────── Ridership ───────────────────────────

export function RidershipDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useRidershipLatestQuery();
  const history = useRidershipHistoryQuery(30);

  const historyData = (history.data ?? []).map((p) => ({ value: p.total, label: '' }));
  const byService = (latest.data?.byService ?? []).slice(0, 10);
  const barData = byService.map((s) => ({
    value: s.value,
    label: s.name,
    frontColor: tone.color,
  }));

  return (
    <>
      <HeroNumber
        value={latest.data ? formatNumber(latest.data.totalRail + latest.data.totalBus) : undefined}
        unit="trips"
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
        delta={
          latest.data
            ? {
                sign: 0,
                label: `${formatCompact(latest.data.totalRail)} rail · ${formatCompact(latest.data.totalBus)} bus`,
              }
            : undefined
        }
      />

      <ChartCard
        title="Last 30 days · total rail"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={historyData.length === 0}
      >
        <LineChart
          data={historyData}
          width={CHART_WIDTH}
          height={180}
          hideDataPoints
          curved
          color={tone.color}
          startFillColor={tone.color}
          endFillColor={tone.color}
          startOpacity={0.25}
          endOpacity={0}
          areaChart
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          formatYLabel={(v: string) => formatCompact(Number(v))}
          noOfSections={3}
          initialSpacing={0}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(historyData.length - 1, 1))}
        />
      </ChartCard>

      <ChartCard
        title="By service · latest day"
        isLoading={latest.isLoading}
        isError={latest.isError}
        empty={barData.length === 0}
      >
        <BarChart
          data={barData}
          width={CHART_WIDTH}
          height={240}
          barWidth={18}
          spacing={14}
          frontColor={tone.color}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          hideRules
          formatYLabel={(v: string) => formatCompact(Number(v))}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          rotateLabel
          noOfSections={3}
        />
      </ChartCard>
    </>
  );
}

// ─────────────────────────── Inflation ───────────────────────────

export function InflationDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useInflationLatestQuery();
  const history = useInflationHistoryQuery(24);

  const data = (history.data ?? []).map((p) => ({ value: p.yoy, label: '' }));

  return (
    <>
      <HeroNumber
        value={latest.data ? formatPercent(latest.data.yoy / 100) : undefined}
        unit="YoY inflation"
        delta={
          latest.data?.mom != null
            ? {
                sign: latest.data.mom > 0 ? 1 : latest.data.mom < 0 ? -1 : 0,
                label: `${latest.data.mom >= 0 ? '+' : ''}${latest.data.mom.toFixed(2)}% MoM · ${latest.data.asOf}`,
              }
            : undefined
        }
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
      />
      <ChartCard
        title="Last 24 months · YoY %"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={data.length === 0}
      >
        <LineChart
          data={data}
          width={CHART_WIDTH}
          height={180}
          hideDataPoints
          curved
          color={tone.color}
          startFillColor={tone.color}
          endFillColor={tone.color}
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
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(data.length - 1, 1))}
        />
      </ChartCard>
    </>
  );
}

// ─────────────────────────── Unemployment ───────────────────────────

export function UnemploymentDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useUnemploymentLatestQuery();
  const history = useUnemploymentHistoryQuery(24);

  const data = (history.data ?? []).map((p) => ({ value: p.rate, label: '' }));

  return (
    <>
      <HeroNumber
        value={latest.data ? formatPercent(latest.data.uRate / 100) : undefined}
        unit="unemployment rate"
        asOf={latest.data?.asOf}
        isLoading={latest.isLoading}
        isError={latest.isError}
        delta={
          latest.data
            ? {
                sign: 0,
                label: `Participation ${latest.data.pRate.toFixed(1)}% · ${formatCompact(latest.data.unemployed * 1000)} unemployed`,
              }
            : undefined
        }
      />
      <ChartCard
        title="Last 24 months"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={data.length === 0}
      >
        <LineChart
          data={data}
          width={CHART_WIDTH}
          height={180}
          hideDataPoints
          curved
          color={tone.color}
          startFillColor={tone.color}
          endFillColor={tone.color}
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
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(data.length - 1, 1))}
        />
      </ChartCard>
    </>
  );
}

// ─────────────────────────── GDP ───────────────────────────

export function GdpDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useGdpLatestQuery();
  const history = useGdpHistoryQuery(12);

  const data = (history.data ?? []).map((p) => ({
    value: p.yoy,
    label: quarterLabel(p.date),
    frontColor: p.yoy >= 0 ? tone.color : theme.semantic.danger,
  }));

  return (
    <>
      <HeroNumber
        value={latest.data ? `${latest.data.yoy >= 0 ? '+' : ''}${latest.data.yoy.toFixed(1)}%` : undefined}
        unit="YoY growth"
        delta={
          latest.data?.qoq != null
            ? {
                sign: latest.data.qoq > 0 ? 1 : latest.data.qoq < 0 ? -1 : 0,
                label: `${latest.data.qoq >= 0 ? '+' : ''}${latest.data.qoq.toFixed(1)}% QoQ · ${quarterLabel(latest.data.asOf)}`,
              }
            : undefined
        }
        asOf={latest.data ? quarterLabel(latest.data.asOf) : undefined}
        isLoading={latest.isLoading}
        isError={latest.isError}
      />
      <ChartCard
        title="Last 12 quarters · YoY %"
        isLoading={history.isLoading}
        isError={history.isError}
        empty={data.length === 0}
      >
        <BarChart
          data={data}
          width={CHART_WIDTH}
          height={200}
          barWidth={16}
          spacing={Math.max(2, (CHART_WIDTH - 16 * data.length - 24) / Math.max(data.length, 1))}
          frontColor={tone.color}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          hideRules
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          noOfSections={3}
        />
      </ChartCard>
    </>
  );
}

function quarterLabel(date: string): string {
  const dt = new Date(date);
  const q = Math.floor(dt.getMonth() / 3) + 1;
  return `Q${q} ${dt.getFullYear()}`;
}

// ─────────────────────────── Population ───────────────────────────

export function PopulationDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const q = usePopulationLatestQuery();

  const byState = (q.data?.byState ?? []).slice(0, 16);
  const data = byState.map((s) => ({
    value: s.population,
    label: s.state.length > 9 ? s.state.slice(0, 7) + '…' : s.state,
    frontColor: tone.color,
  }));

  return (
    <>
      <HeroNumber
        value={q.data ? formatCompact(q.data.total * 1000) : undefined}
        unit="people"
        asOf={q.data ? new Date(q.data.asOf).getFullYear().toString() : undefined}
        isLoading={q.isLoading}
        isError={q.isError}
        delta={
          q.data
            ? {
                sign: 0,
                label: `${q.data.byState.length} states + federal territories`,
              }
            : undefined
        }
      />
      <ChartCard
        title={`By state · ${q.data ? new Date(q.data.asOf).getFullYear() : ''}`}
        isLoading={q.isLoading}
        isError={q.isError}
        empty={data.length === 0}
      >
        <BarChart
          data={data}
          width={CHART_WIDTH}
          height={260}
          barWidth={14}
          spacing={10}
          frontColor={tone.color}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          hideRules
          formatYLabel={(v: string) => formatCompact(Number(v) * 1000)}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          rotateLabel
          noOfSections={3}
        />
      </ChartCard>
    </>
  );
}

// ─────────────────────────── Bits ───────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" align="center" gap={S.xs}>
      <View style={{ width: 8, height: 8, borderRadius: R.pill, backgroundColor: color }} />
      <Text variant="caption" tone="soft">
        {label}
      </Text>
    </Stack>
  );
}
