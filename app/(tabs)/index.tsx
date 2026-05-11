import { Coins, Fuel, Train, TrendingUp } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenScroll, Stack } from '@/components/ui';
import { Greeting } from '@/features/today/Greeting';
import { PulseHero } from '@/features/today/PulseHero';
import { StatTile } from '@/features/today/StatTile';
import { SurpriseCard } from '@/features/today/SurpriseCard';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import {
  useCurrencyLatestQuery,
  useFuelPriceLatestQuery,
  useInflationLatestQuery,
  useRidershipLatestQuery,
} from '@/lib/queries';
import { S } from '@/theme';

export default function Today() {
  const fx = useCurrencyLatestQuery('usd');
  const fuel = useFuelPriceLatestQuery();
  const ridership = useRidershipLatestQuery();
  const inflation = useInflationLatestQuery();

  return (
    <ScreenScroll>
      <Greeting streak={3} />

      <View style={{ marginTop: S.xl }}>
        <PulseHero
          valueLabel={fx.data ? fx.data.rate.toFixed(4) : '—'}
          deltaLabel={
            fx.data
              ? `1 USD → MYR · as of ${fx.data.asOf}`
              : fx.isLoading
                ? 'Loading exchange rate…'
                : 'Exchange rate unavailable'
          }
        />
      </View>

      <Stack direction="row" gap={S.md} style={{ marginTop: S.md }}>
        <StatTile
          label="USD / MYR"
          value={fx.data ? fx.data.rate.toFixed(2) : undefined}
          isLoading={fx.isLoading}
          isError={fx.isError}
          Icon={Coins}
          tone="gold"
          index={0}
        />
        <StatTile
          label="Rail trips · daily"
          value={ridership.data ? formatCompact(ridership.data.totalRail) : undefined}
          isLoading={ridership.isLoading}
          isError={ridership.isError}
          Icon={Train}
          tone="chart-blue"
          index={1}
        />
      </Stack>

      <Stack direction="row" gap={S.md} style={{ marginTop: S.md }}>
        <StatTile
          label="RON95 · per litre"
          value={fuel.data?.ron95 != null ? `RM ${fuel.data.ron95.toFixed(2)}` : undefined}
          isLoading={fuel.isLoading}
          isError={fuel.isError}
          Icon={Fuel}
          tone="chart-teal"
          index={2}
        />
        <StatTile
          label="Inflation · YoY"
          value={inflation.data ? formatPercent(inflation.data.yoy / 100) : undefined}
          isLoading={inflation.isLoading}
          isError={inflation.isError}
          Icon={TrendingUp}
          tone="accent"
          index={3}
        />
      </Stack>

      <View style={{ marginTop: S.xl }}>
        <SurpriseCard
          fact={
            ridership.data
              ? `Malaysians made ${formatNumber(ridership.data.totalRail + ridership.data.totalBus)} public transport trips on ${ridership.data.asOf}.`
              : 'Penang has the highest population density in Malaysia — 1,659 people per km².'
          }
          source="data.gov.my · Prasarana ridership headline"
        />
      </View>
    </ScreenScroll>
  );
}
