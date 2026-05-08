import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWeeklyFuelPrices } from '../api/fuelPrices';
import { PriceCard } from '../components/PriceCard';
import { PriceHistoryHeader, PriceHistoryItem } from '../components/PriceHistoryItem';
import type { WeeklyFuelPrice } from '../types/fuelPrice';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; weeks: WeeklyFuelPrice[] };

export function FuelPriceScreen() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const weeks = await getWeeklyFuelPrices(26);
      setState({ status: 'ready', weeks });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Fetching latest fuel prices…</Text>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load prices</Text>
        <Text style={styles.muted}>{state.message}</Text>
      </SafeAreaView>
    );
  }

  const [latest, ...history] = state.weeks;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={history}
        keyExtractor={(week) => week.date}
        renderItem={({ item }) => <PriceHistoryItem week={item} />}
        ListHeaderComponent={
          <View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Fuel Prices</Text>
              <Text style={styles.subtitle}>Weekly retail prices, Peninsular Malaysia</Text>
            </View>
            {latest && <PriceCard week={latest} />}
            <Text style={styles.sectionTitle}>History</Text>
            <PriceHistoryHeader />
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  titleBlock: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muted: { fontSize: 14, color: '#888', textAlign: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '600', color: '#c0392b' },
});
