import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataView } from '@/components/ui/DataView';
import { useFuelPriceQuery } from '@/api/datasets/fuelPrice';
import { FuelLevelRow } from '@/components/feature/FuelLevelRow';
import { FuelHistoryHeader, FuelHistoryRow } from '@/components/feature/FuelHistoryRow';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

export default function DatasetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'fuelprice') return <FuelDetail />;
  return <UnknownDataset id={id ?? '(none)'} />;
}

function FuelDetail() {
  const T = useTheme();
  const { t } = useI18n();
  const query = useFuelPriceQuery(26);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <Header title={t('fuel.title')} />
      <DataView
        query={query}
        renderLoading={() => <FuelDetailSkeleton />}
      >
        {(weeks) => <FuelDetailBody weeks={weeks} onRefresh={query.refetch} refreshing={query.isRefetching} />}
      </DataView>
    </SafeAreaView>
  );
}

interface FuelDetailBodyProps {
  weeks: WeeklyFuelPrice[];
  onRefresh: () => void;
  refreshing: boolean;
}

function FuelDetailBody({ weeks, onRefresh, refreshing }: FuelDetailBodyProps) {
  const T = useTheme();
  const { t } = useI18n();
  const [latest, ...history] = weeks;

  const stats = useMemo(() => {
    if (weeks.length === 0) return null;
    const ron95Values = weeks.map((w) => w.level.ron95);
    return {
      high: Math.max(...ron95Values),
      low: Math.min(...ron95Values),
      avg: ron95Values.reduce((a, b) => a + b, 0) / ron95Values.length,
    };
  }, [weeks]);

  return (
    <FlatList
      data={history}
      keyExtractor={(w) => w.date}
      renderItem={({ item }) => <FuelHistoryRow week={item} />}
      ListEmptyComponent={
        history.length === 0 ? (
          <View style={{ paddingHorizontal: T.spacing.xl, paddingTop: T.spacing.xl }}>
            <Text style={{ color: T.colors.textMuted, textAlign: 'center' }}>
              {t('common.empty')}
            </Text>
          </View>
        ) : null
      }
      ListHeaderComponent={
        <View style={{ paddingHorizontal: T.spacing.xl, paddingTop: T.spacing.lg, gap: T.spacing.lg }}>
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>
            {t('fuel.subtitle')} · {t('cadence.weekly')}
          </Text>
          {latest && <Card><FuelLevelRow week={latest} /></Card>}
          {stats && (
            <View style={{ flexDirection: 'row', gap: T.spacing.sm }}>
              <StatCard label={t('fuel.high')} value={`RM ${stats.high.toFixed(2)}`} />
              <StatCard label={t('fuel.low')} value={`RM ${stats.low.toFixed(2)}`} />
              <StatCard label={t('fuel.avg')} value={`RM ${stats.avg.toFixed(2)}`} />
            </View>
          )}
          <View>
            <Text
              style={{
                fontFamily: T.fonts.display,
                fontSize: T.fontSize.sectionHead,
                color: T.colors.text,
                marginBottom: T.spacing.sm,
              }}
            >
              {t('fuel.history')}
            </Text>
            <FuelHistoryHeader />
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={T.colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: T.spacing.xxxl }}
    />
  );
}

function FuelDetailSkeleton() {
  const T = useTheme();
  return (
    <View style={{ padding: T.spacing.xl, gap: T.spacing.lg }}>
      <Skeleton width="60%" height={14} />
      <Skeleton height={140} radius={T.radius.lg} />
      <View style={{ flexDirection: 'row', gap: T.spacing.sm }}>
        <Skeleton height={64} radius={T.radius.lg} />
        <Skeleton height={64} radius={T.radius.lg} />
        <Skeleton height={64} radius={T.radius.lg} />
      </View>
      <Skeleton height={300} radius={T.radius.md} />
    </View>
  );
}

function Header({ title }: { title: string }) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.sm },
      ]}
    >
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
        hitSlop={8}
      >
        <ChevronLeft size={24} color={T.colors.text} />
      </Pressable>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.sectionHead,
          color: T.colors.text,
        }}
      >
        {title}
      </Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function UnknownDataset({ id }: { id: string }) {
  const T = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <Header title={`Dataset: ${id}`} />
      <View style={{ padding: T.spacing.xl }}>
        <Text style={{ color: T.colors.textMuted }}>
          This dataset will be wired up in a later plan.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
