import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Linking, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Badge, Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { findDataset, TONE_COLOR, TONE_GLOW } from '@/features/insights/catalogue';
import {
  ComingSoonDetail,
  CurrencyDetail,
  EpfDividendDetail,
  FuelDetail,
  GdpDetail,
  GenericBarDetail,
  GenericLineDetail,
  HouseholdIncomeDetail,
  InflationDetail,
  PopulationDetail,
  ProductivityDetail,
  RidershipDetail,
  UnemploymentDetail,
  type DetailProps,
} from '@/features/insights/details';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

type DetailFC = ComponentType<DetailProps>;

const DETAIL_BY_ID: Record<string, DetailFC> = {
  // Bespoke (have their own hooks and shapes)
  exchangerates_daily_1700: CurrencyDetail,
  fuelprice: FuelDetail,
  cpi_headline: InflationDetail,
  gdp_qtr_nominal: GdpDetail,
  ridership_headline: RidershipDetail,
  lfs_month: UnemploymentDetail,
  population_state: PopulationDetail,
  hh_income: HouseholdIncomeDetail,
  productivity_qtr: ProductivityDetail,
  epf_dividend: EpfDividendDetail,

  // Generic line — time series with a single value column
  organ_pledges: (p) => (
    <GenericLineDetail
      tone={p.tone}
      datasetId="organ_pledges"
      valueField="pledges"
      unit="pledges / day"
      chartTitle="Last 60 days"
      limit={60}
    />
  ),
  trnsc_daily_fpx: (p) => (
    <GenericLineDetail
      tone={p.tone}
      datasetId="trnsc_daily_fpx"
      valueField="value"
      filterField="model"
      filterValue="both"
      unit="MYR / day"
      formatHero={(v) => `RM ${formatCompact(v)}`}
      chartTitle="Last 60 days · FPX value"
      limit={60}
    />
  ),
  covid_cases: (p) => (
    <GenericLineDetail
      tone={p.tone}
      datasetId="covid_cases"
      valueField="cases_new"
      filterField="state"
      filterValue="Malaysia"
      unit="new cases / day"
      chartTitle="Last 60 days · national"
      limit={60}
    />
  ),
  blood_donations: (p) => (
    <GenericLineDetail
      tone={p.tone}
      datasetId="blood_donations"
      valueField="donations"
      filterField="blood_type"
      filterValue="all"
      unit="donations / day"
      chartTitle="Last 60 days"
      limit={60}
    />
  ),

  // Generic bar — categorical snapshot
  monetary_aggregates: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="monetary_aggregates"
      valueField="value"
      categoryField="measure"
      formatHero={(v) => `RM ${formatCompact(v * 1_000_000)}`}
      chartTitle="By measure · latest month"
      maxBars={10}
    />
  ),
  interestrates: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="interestrates"
      valueField="value"
      categoryField="rate"
      filterField="bank"
      filterValue="commercial"
      formatHero={(v) => `${v.toFixed(2)}%`}
      chartTitle="By rate type · commercial banks"
      maxBars={10}
    />
  ),
  payment_instruments: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="payment_instruments"
      valueField="value"
      categoryField="instrument"
      formatHero={(v) => `RM ${formatCompact(v)}`}
      chartTitle="By instrument · latest month"
      maxBars={10}
    />
  ),
  electricity_consumption: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="electricity_consumption"
      valueField="consumption"
      categoryField="sector"
      excludeNames={['total']}
      formatHero={(v) => formatCompact(v)}
      chartTitle="By sector · GWh"
      maxBars={10}
    />
  ),
  electricity_supply: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="electricity_supply"
      valueField="supply"
      categoryField="sector"
      excludeNames={['total']}
      formatHero={(v) => formatCompact(v)}
      chartTitle="By sector · GWh"
      maxBars={10}
    />
  ),
  electricity_access: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="electricity_access"
      valueField="households"
      categoryField="state"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatCompact(v)}
      unit="households (top)"
      chartTitle="Households with electricity · by state"
      maxBars={16}
    />
  ),
  water_consumption: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="water_consumption"
      valueField="value"
      categoryField="state"
      filterField="sector"
      filterValue="domestic"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatCompact(v)}
      unit="million litres"
      chartTitle="Domestic water · by state"
      maxBars={16}
    />
  ),
  water_access: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="water_access"
      valueField="proportion"
      categoryField="state"
      filterField="strata"
      filterValue="overall"
      excludeNames={['Malaysia']}
      formatHero={(v) => `${v.toFixed(1)}%`}
      unit="treated water access"
      chartTitle="Access % · by state"
      maxBars={16}
    />
  ),
  forest_reserve_state: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="forest_reserve_state"
      valueField="area"
      categoryField="state"
      excludeNames={['Malaysia']}
      formatHero={(v) => `${formatCompact(v)} ha`}
      chartTitle="Reserve area · by state"
      maxBars={16}
    />
  ),
  air_pollution: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="air_pollution"
      valueField="concentration"
      categoryField="pollutant"
      formatHero={(v) => v.toFixed(3)}
      chartTitle="Concentration by pollutant"
      maxBars={10}
    />
  ),
  ghg_emissions: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="ghg_emissions"
      valueField="emissions"
      categoryField="source"
      excludeNames={['total', 'net']}
      formatHero={(v) => formatCompact(v)}
      unit="kt CO₂ eq"
      chartTitle="By source · latest year"
      maxBars={12}
    />
  ),
  cellular_subscribers: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="cellular_subscribers"
      valueField="subscriptions"
      categoryField="plan"
      excludeNames={['total']}
      formatHero={(v) => formatCompact(v)}
      unit="subscriptions"
      chartTitle="By plan type"
      maxBars={6}
    />
  ),
  infant_immunisation: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="infant_immunisation"
      valueField="rate"
      categoryField="disease"
      formatHero={(v) => `${v.toFixed(1)}%`}
      chartTitle="Coverage by disease"
      maxBars={12}
    />
  ),
  drug_arrests_age: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="drug_arrests_age"
      valueField="drug_arrests"
      categoryField="age"
      filterField="sex"
      filterValue="both"
      excludeNames={['all']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="By age group"
      maxBars={10}
    />
  ),
  drug_addicts_age: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="drug_addicts_age"
      valueField="addicts"
      categoryField="age_group"
      filterField="state"
      filterValue="Malaysia"
      excludeNames={['total']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="By age group · national"
      maxBars={10}
    />
  ),
  drug_addicts_education: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="drug_addicts_education"
      valueField="addicts"
      categoryField="education"
      filterField="state"
      filterValue="Malaysia"
      excludeNames={['total']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="By education · national"
      maxBars={10}
    />
  ),
  prisoners_state: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="prisoners_state"
      valueField="prisoners"
      categoryField="state"
      filterField="sex"
      filterValue="both"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="Prison population · by state"
      maxBars={16}
    />
  ),
  hospital_beds: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="hospital_beds"
      valueField="beds"
      categoryField="state"
      filterField="type"
      filterValue="all"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="Beds · by state"
      maxBars={16}
    />
  ),
  healthcare_staff: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="healthcare_staff"
      valueField="staff"
      categoryField="state"
      filterField="type"
      filterValue="all"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="Staff · by state"
      maxBars={16}
    />
  ),
  births_annual_state: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="births_annual_state"
      valueField="abs"
      categoryField="state"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="Births · by state"
      maxBars={16}
    />
  ),
  crime_district: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="crime_district"
      valueField="crimes"
      categoryField="state"
      filterField="type"
      filterValue="all"
      excludeNames={['Malaysia']}
      formatHero={(v) => formatNumber(v)}
      chartTitle="Total crime · by state"
      maxBars={16}
    />
  ),
  hies_district: (p) => (
    <GenericBarDetail
      tone={p.tone}
      datasetId="hies_district"
      valueField="income_median"
      categoryField="district"
      formatHero={(v) => `RM ${formatNumber(v)}`}
      unit="median income (top)"
      chartTitle="Median income · top districts"
      maxBars={16}
    />
  ),
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
