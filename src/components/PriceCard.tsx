import { StyleSheet, Text, View } from 'react-native';
import type { WeeklyFuelPrice } from '../types/fuelPrice';

interface PriceCardProps {
  week: WeeklyFuelPrice;
}

export function PriceCard({ week }: PriceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Week of {formatDate(week.date)}</Text>
      <View style={styles.row}>
        <PriceCell name="RON 95" price={week.level.ron95} delta={week.change?.ron95} />
        <PriceCell name="RON 97" price={week.level.ron97} delta={week.change?.ron97} />
        <PriceCell name="Diesel" price={week.level.diesel} delta={week.change?.diesel} />
      </View>
      {week.level.ron95_budi95 !== null && (
        <Text style={styles.subsidy}>
          Budi95 subsidy: RM {week.level.ron95_budi95.toFixed(2)} / litre
        </Text>
      )}
    </View>
  );
}

interface PriceCellProps {
  name: string;
  price: number;
  delta: number | undefined;
}

function PriceCell({ name, price, delta }: PriceCellProps) {
  const arrow = delta === undefined || delta === 0 ? '·' : delta > 0 ? '▲' : '▼';
  const deltaColor = delta === undefined || delta === 0 ? '#888' : delta > 0 ? '#c0392b' : '#27ae60';

  return (
    <View style={styles.cell}>
      <Text style={styles.cellName}>{name}</Text>
      <Text style={styles.cellPrice}>RM {price.toFixed(2)}</Text>
      <Text style={[styles.cellDelta, { color: deltaColor }]}>
        {arrow} {delta !== undefined ? Math.abs(delta).toFixed(2) : '—'}
      </Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 13, color: '#666', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center' },
  cellName: { fontSize: 12, color: '#888', marginBottom: 4 },
  cellPrice: { fontSize: 20, fontWeight: '700', color: '#222' },
  cellDelta: { fontSize: 12, marginTop: 4, fontVariant: ['tabular-nums'] },
  subsidy: { fontSize: 12, color: '#27ae60', marginTop: 14, textAlign: 'center' },
});
