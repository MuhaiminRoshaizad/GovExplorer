import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Activity,
  ArrowUpRight,
  Building2,
  Compass,
  Droplet,
  Gavel,
  HeartPulse,
  type LucideIcon,
  ShieldAlert,
  Stethoscope,
  TreePine,
  Users,
  Zap,
} from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { AppBar, Badge, Card, ScreenScroll, Skeleton, Stack, Tap, Text } from '@/components/ui';
import { useStatePref } from '@/data/StateContext';
import { findState, type MalaysiaState, type StateCode } from '@/data/states';
import { formatCompact, formatNumber } from '@/lib/format';
import { useCategoricalSnapshotQuery, usePopulationLatestQuery } from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

type StatConfig = {
  datasetId: string;
  valueField: string;
  filterField?: string;
  filterValue?: string;
  label: string;
  Icon: LucideIcon;
  tone: string;
  format: (v: number) => string;
};

const STAT_CARDS = (theme: ReturnType<typeof useTheme>['theme']): StatConfig[] => [
  {
    datasetId: 'births_annual_state',
    valueField: 'abs',
    label: 'Annual births',
    Icon: HeartPulse,
    tone: theme.accent.base,
    format: (v) => formatNumber(v),
  },
  {
    datasetId: 'hospital_beds',
    valueField: 'beds',
    filterField: 'type',
    filterValue: 'all',
    label: 'Hospital beds',
    Icon: Building2,
    tone: theme.chart.coral,
    format: (v) => formatNumber(v),
  },
  {
    datasetId: 'healthcare_staff',
    valueField: 'staff',
    filterField: 'type',
    filterValue: 'all',
    label: 'Healthcare workforce',
    Icon: Stethoscope,
    tone: theme.chart.coral,
    format: (v) => formatNumber(v),
  },
  {
    datasetId: 'water_access',
    valueField: 'proportion',
    filterField: 'strata',
    filterValue: 'overall',
    label: 'Water access',
    Icon: Droplet,
    tone: theme.chart.teal,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    datasetId: 'forest_reserve_state',
    valueField: 'area',
    label: 'Forest reserves',
    Icon: TreePine,
    tone: theme.chart.teal,
    format: (v) => `${formatCompact(v)} ha`,
  },
  {
    datasetId: 'electricity_access',
    valueField: 'households',
    label: 'Households w/ electricity',
    Icon: Zap,
    tone: theme.gold.base,
    format: (v) => formatCompact(v),
  },
  {
    datasetId: 'prisoners_state',
    valueField: 'prisoners',
    filterField: 'sex',
    filterValue: 'both',
    label: 'Prison population',
    Icon: Gavel,
    tone: theme.chart.plum,
    format: (v) => formatNumber(v),
  },
  {
    datasetId: 'crime_district',
    valueField: 'crimes',
    filterField: 'type',
    filterValue: 'all',
    label: 'Crime cases',
    Icon: ShieldAlert,
    tone: theme.chart.plum,
    format: (v) => formatNumber(v),
  },
  {
    datasetId: 'drug_addicts_age',
    valueField: 'addicts',
    filterField: 'age_group',
    filterValue: 'total',
    label: 'Drug addicts',
    Icon: Activity,
    tone: theme.chart.plum,
    format: (v) => formatNumber(v),
  },
];

export default function StateDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { theme, mode } = useTheme();
  const { state: userState } = useStatePref();

  const state = findState((code as StateCode) ?? '');

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <RouterStack.Screen options={{ animation: 'slide_from_right' }} />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <AppBar title="Unknown state" />
        <View style={{ padding: S.lg }}>
          <Text variant="body" tone="soft">
            State “{code}” not found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <RouterStack.Screen options={{ animation: 'slide_from_right' }} />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppBar title={state.name} subtitle="Malaysia · state snapshot" />

      <ScreenScroll>
        <ScreenEnter>
          <StateHero state={state} isUser={state.code === userState.code} />
          <PopulationCard state={state} />

          <Text
            variant="micro"
            tone="muted"
            style={{ marginTop: S.xxl, marginBottom: S.sm, marginLeft: S.xs }}
          >
            STATE SNAPSHOT
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.md }}>
            {STAT_CARDS(theme).map((cfg) => (
              <View key={cfg.datasetId + cfg.label} style={{ width: '47.5%' }}>
                <StateStatCard config={cfg} state={state} />
              </View>
            ))}
          </View>
        </ScreenEnter>
      </ScreenScroll>
    </View>
  );
}

function StateHero({ state, isUser }: { state: MalaysiaState; isUser: boolean }) {
  const { theme } = useTheme();
  return (
    <Card
      variant="flat"
      padding={S.xl}
      radius={R.xxl}
      style={{
        marginTop: S.md,
        backgroundColor: isUser ? theme.accent.glow : theme.surfaceMuted,
      }}
    >
      <Stack direction="row" align="center" gap={S.lg}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: R.xl,
            backgroundColor: isUser ? theme.accent.base : theme.brand.base,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            variant="hero"
            style={{ color: '#FFFFFF', fontSize: 28, lineHeight: 32 }}
          >
            {state.code.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          {isUser ? (
            <Badge label="YOUR STATE" tone="accent" />
          ) : (
            <Text variant="micro" tone="muted">
              STATE
            </Text>
          )}
          <Text variant="hero" style={{ marginTop: S.xs }}>
            {state.name}
          </Text>
        </View>
      </Stack>
    </Card>
  );
}

function PopulationCard({ state }: { state: MalaysiaState }) {
  const { theme } = useTheme();
  const q = usePopulationLatestQuery();
  const entry = q.data?.byState.find((s) => s.state === state.apiName);
  const rank = q.data?.byState.findIndex((s) => s.state === state.apiName) ?? -1;

  return (
    <Tap haptic="light" onPress={() => router.push('/dataset/population_state' as never)}>
      <Card variant="flat" padding={S.lg} radius={R.xl} style={{ marginTop: S.md }}>
        <Stack direction="row" align="center" justify="space-between">
          <Stack direction="row" align="center" gap={S.md}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: R.md,
                backgroundColor: theme.accent.glow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color={theme.accent.base} strokeWidth={2} />
            </View>
            <View>
              <Text variant="caption" tone="muted">
                Population · DOSM
              </Text>
              {q.isLoading ? (
                <Skeleton width={120} height={24} />
              ) : entry ? (
                <Stack direction="row" align="baseline" gap={S.xs}>
                  <Text variant="h1">{formatCompact(entry.population * 1000)}</Text>
                  <Text variant="caption" tone="muted">
                    people · rank {rank + 1}/{q.data?.byState.length}
                  </Text>
                </Stack>
              ) : (
                <Text variant="h1" tone="muted">
                  —
                </Text>
              )}
            </View>
          </Stack>
          <ArrowUpRight size={16} color={theme.textMuted} strokeWidth={1.8} />
        </Stack>
      </Card>
    </Tap>
  );
}

function StateStatCard({ config, state }: { config: StatConfig; state: MalaysiaState }) {
  const { theme } = useTheme();
  const q = useCategoricalSnapshotQuery({
    id: config.datasetId,
    valueField: config.valueField,
    categoryField: 'state',
    filterField: config.filterField,
    filterValue: config.filterValue,
  });
  const entry = q.data?.points.find((p) => p.name === state.apiName);
  const Icon = config.Icon;

  return (
    <Tap
      haptic="light"
      onPress={() => router.push(`/dataset/${config.datasetId}` as never)}
      style={{ flex: 1 }}
    >
      <Card variant="flat" padding={S.md} radius={R.xl} style={{ minHeight: 110 }}>
        <Stack direction="row" align="center" justify="space-between">
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: R.md,
              backgroundColor: theme.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} color={config.tone} strokeWidth={2} />
          </View>
          <ArrowUpRight size={14} color={theme.textMuted} strokeWidth={1.6} />
        </Stack>
        <View style={{ marginTop: S.md }}>
          {q.isLoading ? (
            <Skeleton width={80} height={22} />
          ) : entry ? (
            <Text variant="h2">{config.format(entry.value)}</Text>
          ) : (
            <Text variant="h2" tone="muted">
              —
            </Text>
          )}
          <Text variant="caption" tone="soft" style={{ marginTop: 2 }}>
            {config.label}
          </Text>
        </View>
      </Card>
    </Tap>
  );
}
