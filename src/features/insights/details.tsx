import { ArrowDownRight, ArrowUpRight, Lightbulb } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { Badge, Card, Skeleton, Stack, Text } from '@/components/ui';
import { useStatePref } from '@/data/StateContext';
import { stateCodeFor } from '@/data/states';
import { formatCompact, formatDate, formatNumber, formatPercent, formatYear } from '@/lib/format';
import {
  useCategoricalSnapshotQuery,
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
  useTimeSeriesQuery,
  useUnemploymentHistoryQuery,
  useUnemploymentLatestQuery,
} from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

import { categoricalAnalysis, timeSeriesAnalysis } from './analysis';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_INSET = S.lg * 2 + S.md * 2;
const CHART_WIDTH = SCREEN_WIDTH - CHART_INSET;
const X_AXIS_HEIGHT = 64;
const SCROLL_THRESHOLD = 8;
const BAR_SLOT = 38;

type Tone = { color: string; bg: string };
export type DetailProps = { tone: Tone };

// ─────────────────────────── Shared chrome ───────────────────────────

export function HeroNumber({
  value,
  unit,
  delta,
  asOf,
  isLoading,
  isError,
  formatDateLabel = true,
}: {
  value?: string;
  unit?: string;
  delta?: { sign: 1 | -1 | 0; label: string };
  asOf?: string;
  isLoading: boolean;
  isError: boolean;
  formatDateLabel?: boolean;
}) {
  const { theme } = useTheme();
  const asOfLabel = asOf ? (formatDateLabel ? `As of ${formatDate(asOf)}` : `As of ${asOf}`) : '';
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
          <Text variant="numeric" tone="muted">—</Text>
          <Text variant="caption" tone="muted" style={{ marginTop: S.xs }}>
            Couldn’t load this dataset
          </Text>
        </View>
      ) : (
        <View>
          <Stack direction="row" align="baseline" gap={S.sm}>
            <Text variant="numeric">{value}</Text>
            {unit ? <Text variant="bodyMedium" tone="muted">{unit}</Text> : null}
          </Stack>
          <Stack direction="row" align="center" gap={S.xs} style={{ marginTop: S.xs }}>
            {delta && delta.sign !== 0 ? (
              delta.sign > 0 ? (
                <ArrowUpRight size={14} color={theme.semantic.success} strokeWidth={2.4} />
              ) : (
                <ArrowDownRight size={14} color={theme.semantic.danger} strokeWidth={2.4} />
              )
            ) : null}
            <Text variant="caption" tone="soft">{delta?.label ?? asOfLabel}</Text>
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

function AnalysisCard({ insights, isLoading }: { insights: string[]; isLoading: boolean }) {
  const { theme } = useTheme();
  if (isLoading) {
    return (
      <Card variant="outline" padding={S.lg} radius={R.xl} style={{ marginTop: S.md }}>
        <Skeleton width={140} height={12} />
        <View style={{ height: S.md }} />
        <Skeleton width="100%" height={14} />
        <View style={{ height: 6 }} />
        <Skeleton width="80%" height={14} />
      </Card>
    );
  }
  if (insights.length === 0) return null;
  return (
    <Card variant="outline" padding={S.lg} radius={R.xl} style={{ marginTop: S.md }}>
      <Stack direction="row" align="center" gap={S.xs}>
        <Lightbulb size={13} color={theme.textSoft} strokeWidth={1.8} />
        <Text variant="micro" tone="muted">KEY TAKEAWAYS</Text>
      </Stack>
      <View style={{ marginTop: S.sm, gap: 6 }}>
        {insights.map((line, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: S.sm }}>
            <Text variant="body" tone="soft" style={{ width: 8 }}>·</Text>
            <Text variant="body" tone="soft" style={{ flex: 1, lineHeight: 20 }}>{line}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function shortLabel(name: string, max = 7): string {
  if (name.length <= max) return name;
  return name.slice(0, max - 1) + '…';
}

// Tooltip components ----------------------------------------------------------

type TooltipDataPoint = { value: number; date?: string; label?: string };

function makePointerLabel(
  data: TooltipDataPoint[],
  tone: Tone,
  fmt?: (v: number) => string,
  unit?: string
) {
  return (items: { value: number; index: number }[]) => {
    const idx = items?.[0]?.index ?? 0;
    const item = data[idx] ?? items?.[0];
    const value = item?.value ?? items?.[0]?.value ?? 0;
    const dateLabel = item?.date ? formatDate(item.date) : (item?.label ?? '');
    return (
      <TooltipBubble
        title={dateLabel}
        value={fmt ? fmt(value) : formatNumber(value)}
        unit={unit}
        tone={tone}
      />
    );
  };
}

function TooltipBubble({
  title,
  value,
  unit,
  tone,
}: {
  title?: string;
  value: string;
  unit?: string;
  tone: Tone;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: R.md,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: S.md,
        paddingVertical: S.sm,
        minWidth: 100,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      {title ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      <Stack direction="row" align="baseline" gap={4}>
        <Text variant="bodyBold" style={{ color: tone.color }} numberOfLines={1}>
          {value}
        </Text>
        {unit ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {unit}
          </Text>
        ) : null}
      </Stack>
    </View>
  );
}

// Shared chart prop builders --------------------------------------------------

function lineChartProps(theme: any, tone: Tone, data: any[], color: string = tone.color) {
  return {
    width: CHART_WIDTH,
    height: 180,
    hideDataPoints: true,
    curved: true,
    color,
    startFillColor: color,
    endFillColor: color,
    startOpacity: 0.25,
    endOpacity: 0,
    areaChart: true,
    thickness: 2,
    hideRules: true,
    yAxisColor: 'transparent' as const,
    xAxisColor: theme.border,
    yAxisTextStyle: { color: theme.textMuted, fontSize: 10 },
    formatYLabel: (v: string) => formatCompact(Number(v)),
    noOfSections: 3,
    initialSpacing: 0,
    spacing: Math.max(2, (CHART_WIDTH - 12) / Math.max(data.length - 1, 1)),
  };
}

function pointerConfig(theme: any, tone: Tone, labelComponent: any) {
  return {
    pointerStripUptoDataPoint: true,
    pointerStripWidth: 1,
    pointerStripColor: theme.borderStrong,
    pointerColor: tone.color,
    radius: 5,
    pointerLabelWidth: 130,
    pointerLabelHeight: 56,
    pointerVanishDelay: 1200,
    activatePointersOnLongPress: false,
    pointerLabelComponent: labelComponent,
  };
}

function barTooltip(tone: Tone, fmt?: (v: number) => string, unit?: string) {
  return (item: { value: number; label?: string }) => (
    <TooltipBubble
      title={item.label}
      value={fmt ? fmt(item.value) : formatNumber(item.value)}
      unit={unit}
      tone={tone}
    />
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

// ─────────────────────────── Generic line ───────────────────────────

type GenericTSProps = DetailProps & {
  datasetId: string;
  valueField: string;
  filterField?: string;
  filterValue?: string;
  unit?: string;
  formatHero?: (v: number) => string;
  chartTitle: string;
  limit?: number;
  periodLabel?: string;
};

export function GenericLineDetail({
  tone,
  datasetId,
  valueField,
  filterField,
  filterValue,
  unit,
  formatHero,
  chartTitle,
  limit = 60,
  periodLabel,
}: GenericTSProps) {
  const { theme } = useTheme();
  const q = useTimeSeriesQuery({ id: datasetId, valueField, filterField, filterValue, limit });
  const points = q.data ?? [];
  const data = points.map((p) => ({ value: p.value, label: '', date: p.date }));
  const latest = points[points.length - 1];
  const insights = timeSeriesAnalysis(points, { unit, fmt: formatHero, periodLabel });

  return (
    <>
      <HeroNumber
        value={latest ? (formatHero ? formatHero(latest.value) : formatNumber(latest.value)) : undefined}
        unit={unit}
        asOf={latest?.date}
        isLoading={q.isLoading}
        isError={q.isError}
      />
      <ChartCard
        title={chartTitle}
        isLoading={q.isLoading}
        isError={q.isError}
        empty={data.length === 0}
      >
        <LineChart
          data={data}
          {...lineChartProps(theme, tone, data)}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(data, tone, formatHero, unit))}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={q.isLoading} />
    </>
  );
}

// ─────────────────────────── Generic bar ───────────────────────────

type GenericBarProps = DetailProps & {
  datasetId: string;
  valueField: string;
  categoryField: string;
  filterField?: string;
  filterValue?: string;
  excludeNames?: string[];
  unit?: string;
  formatHero?: (v: number) => string;
  chartTitle: string;
  maxBars?: number;
  rotateLabel?: boolean;
};

export function GenericBarDetail({
  tone,
  datasetId,
  valueField,
  categoryField,
  filterField,
  filterValue,
  excludeNames,
  unit,
  formatHero,
  chartTitle,
  maxBars = 16,
  rotateLabel = true,
}: GenericBarProps) {
  const { theme } = useTheme();
  const { state: userState } = useStatePref();
  const q = useCategoricalSnapshotQuery({
    id: datasetId,
    valueField,
    categoryField,
    filterField,
    filterValue,
    excludeNames,
  });

  const points = (q.data?.points ?? []).slice(0, maxBars);
  const total = points.reduce((acc, p) => acc + p.value, 0);
  const top = points[0];

  const isStateChart = categoryField === 'state' || categoryField === 'district';
  const userStateMatch =
    isStateChart ? points.find((p) => p.name === userState.apiName) : undefined;

  const labelFor = (name: string) =>
    categoryField === 'state' ? stateCodeFor(name) : shortLabel(name, 6);

  const data = points.map((p) => {
    const isUserState = isStateChart && p.name === userState.apiName;
    return {
      value: p.value,
      label: labelFor(p.name),
      fullLabel: p.name,
      frontColor: isUserState ? theme.accent.base : tone.color,
    };
  });

  const scrollable = data.length > SCROLL_THRESHOLD;
  const barWidth = scrollable ? 22 : Math.max(8, Math.min(20, (CHART_WIDTH - 40) / data.length - 8));
  const spacing = scrollable ? 16 : Math.max(4, (CHART_WIDTH - 40) / data.length - 14);
  const renderWidth = scrollable ? data.length * BAR_SLOT + 64 : CHART_WIDTH;

  const insights = categoricalAnalysis(points, {
    unit,
    fmt: formatHero,
    userStateName: isStateChart ? userState.apiName : undefined,
  });

  return (
    <>
      <HeroNumber
        value={top ? (formatHero ? formatHero(top.value) : formatNumber(top.value)) : undefined}
        unit={top ? `${shortLabel(top.name, 16)} (top)` : unit}
        delta={
          q.data && points.length > 1
            ? { sign: 0, label: `${points.length} entries · total ${formatCompact(total)}` }
            : undefined
        }
        asOf={q.data?.asOf}
        isLoading={q.isLoading}
        isError={q.isError}
      />

      {userStateMatch ? (
        <Card
          variant="flat"
          padding={S.md}
          radius={R.lg}
          style={{ marginTop: S.md, backgroundColor: theme.accent.glow, borderWidth: 0 }}
        >
          <Stack direction="row" align="center" justify="space-between">
            <Stack gap={2}>
              <Text variant="micro" style={{ color: theme.accent.base }}>YOUR STATE</Text>
              <Text variant="bodyBold">{userStateMatch.name}</Text>
            </Stack>
            <Text variant="h3" style={{ color: theme.accent.base }}>
              {formatHero ? formatHero(userStateMatch.value) : formatNumber(userStateMatch.value)}
            </Text>
          </Stack>
        </Card>
      ) : null}

      <ChartCard
        title={`${chartTitle}${scrollable ? ' · scroll →' : ''}`}
        isLoading={q.isLoading}
        isError={q.isError}
        empty={data.length === 0}
      >
        <ScrollView
          horizontal={scrollable}
          scrollEnabled={scrollable}
          showsHorizontalScrollIndicator={false}
        >
          <BarChart
            data={data}
            width={renderWidth}
            height={240}
            barWidth={barWidth}
            spacing={spacing}
            frontColor={tone.color}
            yAxisColor="transparent"
            xAxisColor={theme.border}
            hideRules
            formatYLabel={(v: string) => formatCompact(Number(v))}
            yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelsHeight={X_AXIS_HEIGHT}
            rotateLabel={rotateLabel}
            noOfSections={3}
            renderTooltip={barTooltip(tone, formatHero, unit)}
          />
        </ScrollView>
      </ChartCard>

      <AnalysisCard insights={insights} isLoading={q.isLoading} />
    </>
  );
}

// ─────────────────────────── Currency ───────────────────────────

export function CurrencyDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useCurrencyLatestQuery('usd');
  const history = useCurrencyHistoryQuery('usd', 30);

  const points = history.data ?? [];
  const data = points.map((p) => ({ value: p.rate, label: '', date: p.date }));
  const delta = latest.data?.delta;
  const deltaLabel =
    delta != null
      ? `${delta >= 0 ? '+' : ''}${delta.toFixed(4)} vs prev day · ${latest.data?.asOf ? formatDate(latest.data.asOf) : ''}`
      : '';

  const fmt = (v: number) => v.toFixed(4);
  const insights = timeSeriesAnalysis(points.map((p) => ({ date: p.date, value: p.rate })), {
    unit: 'MYR per USD',
    fmt,
    periodLabel: 'day',
  });

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
          {...lineChartProps(theme, tone, data)}
          formatYLabel={(v: string) => Number(v).toFixed(2)}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(data, tone, fmt, 'MYR / USD'))}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={history.isLoading} />
    </>
  );
}

// ─────────────────────────── Fuel ───────────────────────────

export function FuelDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useFuelPriceLatestQuery();
  const history = useFuelPriceHistoryQuery(26);

  const hist = history.data ?? [];
  const ron95Data = hist.map((p) => ({ value: p.ron95, label: '', date: p.date }));
  const ron97Data = hist.map((p) => ({ value: p.ron97, label: '', date: p.date }));
  const dieselData = hist.map((p) => ({ value: p.diesel, label: '', date: p.date }));

  const delta = latest.data?.weeklyDeltaRon95;
  const deltaLabel =
    delta != null
      ? `RON95 ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} this week`
      : '';

  const fmt = (v: number) => `RM ${v.toFixed(2)}`;
  const insights = timeSeriesAnalysis(
    hist.map((p) => ({ date: p.date, value: p.ron95 })),
    { unit: '/ litre', fmt, periodLabel: 'week' }
  );

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
              <Text variant="caption" tone="muted">RON97</Text>
              <Text variant="h2">RM {latest.data.ron97?.toFixed(2) ?? '—'}</Text>
            </Stack>
            <Stack gap={S.xxs}>
              <Text variant="caption" tone="muted">Diesel</Text>
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
          formatYLabel={(v: string) => `RM${Number(v).toFixed(1)}`}
          noOfSections={3}
          initialSpacing={4}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(ron95Data.length - 1, 1))}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(ron95Data, tone, fmt, 'RON95'))}
        />
        <Stack direction="row" gap={S.md} style={{ paddingHorizontal: S.sm, marginTop: S.sm }}>
          <LegendDot color={tone.color} label="RON95" />
          <LegendDot color={theme.chart.coral} label="RON97" />
          <LegendDot color={theme.chart.teal} label="Diesel" />
        </Stack>
      </ChartCard>

      <AnalysisCard insights={insights} isLoading={history.isLoading} />
    </>
  );
}

// ─────────────────────────── Ridership ───────────────────────────

export function RidershipDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useRidershipLatestQuery();
  const history = useRidershipHistoryQuery(30);

  const hist = history.data ?? [];
  const historyData = hist.map((p) => ({ value: p.total, label: '', date: p.date }));
  const byService = (latest.data?.byService ?? []).slice(0, 10);
  const barData = byService.map((s) => ({
    value: s.value,
    label: shortLabel(s.name, 7),
    fullLabel: s.name,
    frontColor: tone.color,
  }));

  const insights = timeSeriesAnalysis(hist.map((p) => ({ date: p.date, value: p.total })), {
    unit: 'trips',
    fmt: (v) => formatCompact(v),
    periodLabel: 'day',
  });

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
            ? { sign: 0, label: `${formatCompact(latest.data.totalRail)} rail · ${formatCompact(latest.data.totalBus)} bus` }
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
          {...lineChartProps(theme, tone, historyData)}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(historyData, tone, formatCompact, 'rail trips'))}
        />
      </ChartCard>
      <ChartCard
        title="By service · latest day · scroll →"
        isLoading={latest.isLoading}
        isError={latest.isError}
        empty={barData.length === 0}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={barData}
            width={barData.length * BAR_SLOT + 64}
            height={260}
            barWidth={22}
            spacing={16}
            frontColor={tone.color}
            yAxisColor="transparent"
            xAxisColor={theme.border}
            hideRules
            formatYLabel={(v: string) => formatCompact(Number(v))}
            yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelsHeight={X_AXIS_HEIGHT}
            rotateLabel
            noOfSections={3}
            renderTooltip={barTooltip(tone, formatCompact, 'trips')}
          />
        </ScrollView>
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={history.isLoading} />
    </>
  );
}

// ─────────────────────────── Inflation ───────────────────────────

export function InflationDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useInflationLatestQuery();
  const history = useInflationHistoryQuery(24);
  const points = history.data ?? [];
  const data = points.map((p) => ({ value: p.yoy, label: '', date: p.date }));

  const fmt = (v: number) => `${v.toFixed(2)}%`;
  const insights = timeSeriesAnalysis(points.map((p) => ({ date: p.date, value: p.yoy })), {
    unit: 'YoY',
    fmt,
    periodLabel: 'month',
  });

  return (
    <>
      <HeroNumber
        value={latest.data ? formatPercent(latest.data.yoy / 100) : undefined}
        unit="YoY inflation"
        delta={
          latest.data?.mom != null
            ? {
                sign: latest.data.mom > 0 ? 1 : latest.data.mom < 0 ? -1 : 0,
                label: `${latest.data.mom >= 0 ? '+' : ''}${latest.data.mom.toFixed(2)}% MoM · ${formatDate(latest.data.asOf)}`,
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
          {...lineChartProps(theme, tone, data)}
          formatYLabel={(v: string) => `${Number(v).toFixed(1)}%`}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(data, tone, fmt))}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={history.isLoading} />
    </>
  );
}

// ─────────────────────────── Unemployment ───────────────────────────

export function UnemploymentDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useUnemploymentLatestQuery();
  const history = useUnemploymentHistoryQuery(24);
  const points = history.data ?? [];
  const data = points.map((p) => ({ value: p.rate, label: '', date: p.date }));

  const fmt = (v: number) => `${v.toFixed(2)}%`;
  const insights = timeSeriesAnalysis(points.map((p) => ({ date: p.date, value: p.rate })), {
    unit: 'unemployment',
    fmt,
    periodLabel: 'month',
  });

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
            ? { sign: 0, label: `Participation ${latest.data.pRate.toFixed(1)}% · ${formatCompact(latest.data.unemployed * 1000)} unemployed` }
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
          {...lineChartProps(theme, tone, data)}
          formatYLabel={(v: string) => `${Number(v).toFixed(1)}%`}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(data, tone, fmt))}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={history.isLoading} />
    </>
  );
}

// ─────────────────────────── GDP ───────────────────────────

export function GdpDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const latest = useGdpLatestQuery();
  const history = useGdpHistoryQuery(12);
  const points = history.data ?? [];
  const data = points.map((p) => ({
    value: p.yoy,
    label: quarterLabel(p.date),
    fullLabel: quarterLabel(p.date),
    frontColor: p.yoy >= 0 ? tone.color : theme.semantic.danger,
  }));
  const fmt = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  const insights = timeSeriesAnalysis(points.map((p) => ({ date: p.date, value: p.yoy })), {
    unit: 'YoY',
    fmt,
    periodLabel: 'quarter',
  });

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
        formatDateLabel={false}
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
          height={220}
          barWidth={16}
          spacing={Math.max(2, (CHART_WIDTH - 16 * data.length - 24) / Math.max(data.length, 1))}
          frontColor={tone.color}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          hideRules
          formatYLabel={(v: string) => `${Number(v).toFixed(0)}%`}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          xAxisLabelsHeight={X_AXIS_HEIGHT}
          rotateLabel
          noOfSections={3}
          renderTooltip={barTooltip(tone, fmt)}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={history.isLoading} />
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
  const { state: userState } = useStatePref();
  const q = usePopulationLatestQuery();
  const byState = (q.data?.byState ?? []).slice(0, 16);
  const userEntry = byState.find((s) => s.state === userState.apiName);

  const data = byState.map((s) => ({
    value: s.population,
    label: stateCodeFor(s.state),
    fullLabel: s.state,
    frontColor: s.state === userState.apiName ? theme.accent.base : tone.color,
  }));

  const insights = categoricalAnalysis(
    byState.map((s) => ({ name: s.state, value: s.population })),
    {
      fmt: (v) => formatCompact(v * 1000),
      userStateName: userState.apiName,
    }
  );

  const scrollable = data.length > SCROLL_THRESHOLD;
  const renderWidth = scrollable ? data.length * BAR_SLOT + 64 : CHART_WIDTH;

  return (
    <>
      <HeroNumber
        value={q.data ? formatCompact(q.data.total * 1000) : undefined}
        unit="people"
        asOf={q.data ? formatYear(q.data.asOf) : undefined}
        isLoading={q.isLoading}
        isError={q.isError}
        formatDateLabel={false}
        delta={q.data ? { sign: 0, label: `${q.data.byState.length} states + federal territories` } : undefined}
      />

      {userEntry ? (
        <Card
          variant="flat"
          padding={S.md}
          radius={R.lg}
          style={{ marginTop: S.md, backgroundColor: theme.accent.glow, borderWidth: 0 }}
        >
          <Stack direction="row" align="center" justify="space-between">
            <Stack gap={2}>
              <Text variant="micro" style={{ color: theme.accent.base }}>YOUR STATE</Text>
              <Text variant="bodyBold">{userEntry.state}</Text>
            </Stack>
            <Text variant="h3" style={{ color: theme.accent.base }}>
              {formatCompact(userEntry.population * 1000)}
            </Text>
          </Stack>
        </Card>
      ) : null}

      <ChartCard
        title={`By state · ${q.data ? formatYear(q.data.asOf) : ''}${scrollable ? ' · scroll →' : ''}`}
        isLoading={q.isLoading}
        isError={q.isError}
        empty={data.length === 0}
      >
        <ScrollView
          horizontal={scrollable}
          scrollEnabled={scrollable}
          showsHorizontalScrollIndicator={false}
        >
          <BarChart
            data={data}
            width={renderWidth}
            height={260}
            barWidth={22}
            spacing={16}
            frontColor={tone.color}
            yAxisColor="transparent"
            xAxisColor={theme.border}
            hideRules
            formatYLabel={(v: string) => formatCompact(Number(v) * 1000)}
            yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
            xAxisLabelsHeight={X_AXIS_HEIGHT}
            rotateLabel
            noOfSections={3}
            renderTooltip={barTooltip(tone, (v) => formatCompact(v * 1000), 'people')}
          />
        </ScrollView>
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={q.isLoading} />
    </>
  );
}

// ─────────────────────────── Household income ───────────────────────────

export function HouseholdIncomeDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const mean = useTimeSeriesQuery({ id: 'hh_income', valueField: 'income_mean', limit: 12 });
  const median = useTimeSeriesQuery({ id: 'hh_income', valueField: 'income_median', limit: 12 });
  const meanArr = mean.data ?? [];
  const medianArr = median.data ?? [];
  const meanData = meanArr.map((p) => ({ value: p.value, label: '', date: p.date }));
  const medianData = medianArr.map((p) => ({ value: p.value, label: '', date: p.date }));
  const latestMedian = medianArr[medianArr.length - 1];

  const fmt = (v: number) => `RM ${formatNumber(v)}`;
  const insights = timeSeriesAnalysis(medianArr, { unit: 'median monthly', fmt });

  return (
    <>
      <HeroNumber
        value={latestMedian ? `RM ${formatNumber(latestMedian.value)}` : undefined}
        unit="median / month"
        asOf={latestMedian?.date}
        isLoading={median.isLoading}
        isError={median.isError}
        delta={
          meanArr[meanArr.length - 1]
            ? { sign: 0, label: `Mean RM ${formatNumber(meanArr[meanArr.length - 1].value)}` }
            : undefined
        }
      />
      <ChartCard
        title="Median + mean over time"
        isLoading={mean.isLoading || median.isLoading}
        isError={mean.isError || median.isError}
        empty={meanData.length === 0}
      >
        <LineChart
          data={medianData}
          data2={meanData}
          width={CHART_WIDTH}
          height={200}
          hideDataPoints
          curved
          color1={tone.color}
          color2={theme.chart.coral}
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          formatYLabel={(v: string) => formatCompact(Number(v))}
          noOfSections={3}
          initialSpacing={4}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(medianData.length - 1, 1))}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(medianData, tone, fmt, 'median'))}
        />
        <Stack direction="row" gap={S.md} style={{ paddingHorizontal: S.sm, marginTop: S.sm }}>
          <LegendDot color={tone.color} label="Median" />
          <LegendDot color={theme.chart.coral} label="Mean" />
        </Stack>
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={median.isLoading} />
    </>
  );
}

// ─────────────────────────── Productivity ───────────────────────────

export function ProductivityDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const q = useCategoricalSnapshotQuery({
    id: 'productivity_qtr',
    valueField: 'output_hour',
    categoryField: 'sector',
    filterField: 'series',
    filterValue: 'abs',
  });
  const all = q.data?.points ?? [];
  const overall = all.find((p) => p.name === 'p0');
  const points = all.filter((p) => p.name !== 'p0').slice(0, 10);
  const data = points.map((p) => ({
    value: p.value,
    label: p.name,
    fullLabel: `Sector ${p.name}`,
    frontColor: tone.color,
  }));
  const fmt = (v: number) => `RM ${v.toFixed(1)}`;
  const insights = categoricalAnalysis(points, { unit: 'RM / hour', fmt });

  return (
    <>
      <HeroNumber
        value={overall ? `RM ${overall.value.toFixed(1)}` : undefined}
        unit="output / hour (overall)"
        asOf={q.data ? quarterLabel(q.data.asOf) : undefined}
        isLoading={q.isLoading}
        isError={q.isError}
        formatDateLabel={false}
      />
      <ChartCard
        title="By sector"
        isLoading={q.isLoading}
        isError={q.isError}
        empty={data.length === 0}
      >
        <BarChart
          data={data}
          width={CHART_WIDTH}
          height={220}
          barWidth={16}
          spacing={10}
          frontColor={tone.color}
          yAxisColor="transparent"
          xAxisColor={theme.border}
          hideRules
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 9 }}
          xAxisLabelsHeight={X_AXIS_HEIGHT}
          rotateLabel
          noOfSections={3}
          renderTooltip={barTooltip(tone, fmt)}
        />
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={q.isLoading} />
    </>
  );
}

// ─────────────────────────── EPF dividend ───────────────────────────

export function EpfDividendDetail({ tone }: DetailProps) {
  const { theme } = useTheme();
  const conv = useTimeSeriesQuery({ id: 'epf_dividend', valueField: 'conventional', limit: 12 });
  const shariah = useTimeSeriesQuery({ id: 'epf_dividend', valueField: 'shariah', limit: 12 });
  const convArr = conv.data ?? [];
  const shariahArr = shariah.data ?? [];
  const convData = convArr.map((p) => ({ value: p.value, label: '', date: p.date }));
  const shariahData = shariahArr.map((p) => ({ value: p.value, label: '', date: p.date }));
  const latestConv = convArr[convArr.length - 1];
  const latestShariah = shariahArr[shariahArr.length - 1];

  const fmt = (v: number) => `${v.toFixed(2)}%`;
  const insights = timeSeriesAnalysis(convArr, { unit: 'conventional', fmt, periodLabel: 'year' });

  return (
    <>
      <HeroNumber
        value={latestConv ? `${latestConv.value.toFixed(2)}%` : undefined}
        unit="conventional"
        asOf={latestConv?.date}
        delta={
          latestShariah
            ? { sign: 0, label: `${latestShariah.value.toFixed(2)}% Shariah · ${formatYear(latestShariah.date)}` }
            : undefined
        }
        isLoading={conv.isLoading}
        isError={conv.isError}
      />
      <ChartCard
        title="Last 12 years"
        isLoading={conv.isLoading}
        isError={conv.isError}
        empty={convData.length === 0}
      >
        <LineChart
          data={convData}
          data2={shariahData}
          width={CHART_WIDTH}
          height={200}
          hideDataPoints
          curved
          color1={tone.color}
          color2={theme.chart.teal}
          thickness={2}
          hideRules
          yAxisColor="transparent"
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          formatYLabel={(v: string) => `${Number(v).toFixed(0)}%`}
          noOfSections={3}
          initialSpacing={4}
          spacing={Math.max(2, (CHART_WIDTH - 12) / Math.max(convData.length - 1, 1))}
          pointerConfig={pointerConfig(theme, tone, makePointerLabel(convData, tone, fmt, 'conventional'))}
        />
        <Stack direction="row" gap={S.md} style={{ paddingHorizontal: S.sm, marginTop: S.sm }}>
          <LegendDot color={tone.color} label="Conventional" />
          <LegendDot color={theme.chart.teal} label="Shariah" />
        </Stack>
      </ChartCard>
      <AnalysisCard insights={insights} isLoading={conv.isLoading} />
    </>
  );
}

// ─────────────────────────── Bits ───────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" align="center" gap={S.xs}>
      <View style={{ width: 8, height: 8, borderRadius: R.pill, backgroundColor: color }} />
      <Text variant="caption" tone="soft">{label}</Text>
    </Stack>
  );
}
