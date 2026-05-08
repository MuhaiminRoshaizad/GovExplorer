import { StyleSheet, Text, View } from 'react-native';
import type { WeeklyFuelPrice } from '../types/fuelPrice';

interface PriceHistoryItemProps {
  week: WeeklyFuelPrice;
}

export function PriceHistoryItem({ week }: PriceHistoryItemProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.date}>{formatShortDate(week.date)}</Text>
      <Text style={styles.price}>{week.level.ron95.toFixed(2)}</Text>
      <Text style={styles.price}>{week.level.ron97.toFixed(2)}</Text>
      <Text style={styles.price}>{week.level.diesel.toFixed(2)}</Text>
    </View>
  );
}

export function PriceHistoryHeader() {
  return (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.date, styles.headerText]}>Week</Text>
      <Text style={[styles.price, styles.headerText]}>RON 95</Text>
      <Text style={[styles.price, styles.headerText]}>RON 97</Text>
      <Text style={[styles.price, styles.headerText]}>Diesel</Text>
    </View>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  header: { backgroundColor: '#f5f5f5', borderBottomWidth: 1 },
  headerText: { fontWeight: '600', color: '#555', fontSize: 12 },
  date: { flex: 2, fontSize: 14, color: '#444' },
  price: { flex: 1, fontSize: 14, color: '#222', textAlign: 'right', fontVariant: ['tabular-nums'] },
});
