import { ScrollView, StyleSheet } from 'react-native';
import { useExchangeRateQuery } from '@/api/datasets/exchangeRate';
import { useWeatherForecastQuery } from '@/api/datasets/weatherForecast';
import { useWeatherWarningQuery } from '@/api/datasets/weatherWarning';
import { useRidershipHeadlineQuery } from '@/api/datasets/ridershipHeadline';
import { useLocation } from '@/hooks/useLocation';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { IndicatorTile } from './IndicatorTile';

const RAIL_FIELDS = [
  'rail_lrt_kj',
  'rail_lrt_ampang',
  'rail_mrt_kajang',
  'rail_mrt_pjy',
  'rail_monorail',
  'rail_komuter',
  'rail_komuter_utara',
  'rail_ets',
  'rail_tebrau',
  'rail_intercity',
] as const;

export function IndicatorStrip() {
  const T = useTheme();
  const { state } = useLocation();
  const { t } = useI18n();

  const weather = useWeatherForecastQuery(state.metLocationId);
  const warning = useWeatherWarningQuery();
  const fx = useExchangeRateQuery(['USD']);
  const ridership = useRidershipHeadlineQuery(7);

  const today = weather.data?.[0];
  const usd = fx.data?.[0];
  const ridershipPoints = (ridership.data ?? [])
    .map((r) => RAIL_FIELDS.reduce((sum, k) => sum + (r[k] ?? 0), 0))
    .reverse();
  const ridershipLatest = ridershipPoints[ridershipPoints.length - 1];
  const ridershipPrev = ridershipPoints[ridershipPoints.length - 2];
  const ridershipTrend: 'up' | 'down' | 'flat' =
    ridershipLatest === undefined || ridershipPrev === undefined
      ? 'flat'
      : ridershipLatest > ridershipPrev
        ? 'up'
        : ridershipLatest < ridershipPrev
          ? 'down'
          : 'flat';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: T.spacing.xl, gap: T.spacing.sm }]}
    >
      <IndicatorTile
        label={t('cadence.daily')}
        value={today ? `${today.min_temp}–${today.max_temp}°C` : '—'}
        hint={today ? today.summary_forecast : ''}
        emoji="⛅"
      />
      {warning.data && warning.data.length > 0 && (
        <IndicatorTile
          label="Warning"
          value="⚠️"
          hint={warning.data[0].heading_en}
          emoji="⚠️"
        />
      )}
      <IndicatorTile
        label="USD/MYR"
        value={usd ? usd.rate.toFixed(4) : '—'}
        hint={usd?.date}
        emoji="💱"
      />
      <IndicatorTile
        label="Transit ridership"
        value={ridershipLatest ? new Intl.NumberFormat().format(ridershipLatest) : '—'}
        hint="rail+bus, yesterday"
        spark={ridershipPoints}
        trend={ridershipTrend}
        emoji="🚆"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 4 },
});
