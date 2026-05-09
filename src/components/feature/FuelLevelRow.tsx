import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

interface FuelLevelRowProps {
  week: WeeklyFuelPrice;
}

export function FuelLevelRow({ week }: FuelLevelRowProps) {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <View>
      <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginBottom: 12 }}>
        {t('fuel.weekOf', { date: formatDate(week.date) })}
      </Text>
      <View style={styles.row}>
        <Cell name={t('fuel.ron95')} price={week.level.ron95} delta={week.change?.ron95} />
        <Cell name={t('fuel.ron97')} price={week.level.ron97} delta={week.change?.ron97} />
        <Cell name={t('fuel.diesel')} price={week.level.diesel} delta={week.change?.diesel} />
      </View>
      {week.level.ron95_budi95 !== null && (
        <Text
          style={{
            fontSize: T.fontSize.label,
            color: T.colors.success,
            marginTop: 14,
            textAlign: 'center',
          }}
        >
          {t('fuel.budi95', { value: week.level.ron95_budi95.toFixed(2) })}
        </Text>
      )}
    </View>
  );
}

interface CellProps {
  name: string;
  price: number;
  delta: number | undefined;
}

function Cell({ name, price, delta }: CellProps) {
  const T = useTheme();
  const arrow = delta === undefined || delta === 0 ? '·' : delta > 0 ? '▲' : '▼';
  const deltaColor =
    delta === undefined || delta === 0
      ? T.colors.textMuted
      : delta > 0
        ? T.colors.danger
        : T.colors.success;

  return (
    <View style={styles.cell}>
      <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginBottom: 4 }}>
        {name}
      </Text>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.hero - 2,
          color: T.colors.text,
        }}
      >
        RM {price.toFixed(2)}
      </Text>
      <Text
        style={{
          fontSize: T.fontSize.label,
          color: deltaColor,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {arrow} {delta !== undefined ? Math.abs(delta).toFixed(2) : '—'}
      </Text>
    </View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center' },
});
