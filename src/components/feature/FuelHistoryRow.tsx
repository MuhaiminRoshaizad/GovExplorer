import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

interface FuelHistoryRowProps {
  week: WeeklyFuelPrice;
}

export function FuelHistoryRow({ week }: FuelHistoryRowProps) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.xl },
      ]}
    >
      <Text style={[styles.date, { color: T.colors.textMuted, fontSize: T.fontSize.body }]}>
        {formatShortDate(week.date)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.ron95.toFixed(2)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.ron97.toFixed(2)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.diesel.toFixed(2)}
      </Text>
    </View>
  );
}

export function FuelHistoryHeader() {
  const T = useTheme();
  const { t } = useI18n();
  const headerStyle = {
    color: T.colors.textMuted,
    fontWeight: T.fontWeight.semibold,
    fontSize: T.fontSize.label,
  } as const;
  return (
    <View
      style={[
        styles.row,
        styles.header,
        { backgroundColor: T.colors.bgAlt, borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.xl },
      ]}
    >
      <Text style={[styles.date, headerStyle]}>{t('fuel.week')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.ron95')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.ron97')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.diesel')}</Text>
    </View>
  );
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: { borderBottomWidth: 1 },
  date: { flex: 2 },
  price: { flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
