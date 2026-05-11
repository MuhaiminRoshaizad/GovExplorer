import { CloudRain, Coins, Train, TrendingUp } from 'lucide-react-native';
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
          valueLabel={fx.data ? fx.data.rate.toFixed(4) : '4.43'}
          deltaLabel={fx.data ? `MYR per ${fx.data.pair.split('/')[1]} · as of ${fx.data.asOf}` : 'MYR / USD'}
        />
      </View>

      <Stack direction="row" gap={S.md} style={{ marginTop: S.md }}>
        <StatTile
          label={fx.data ? `MYR / ${fx.data.pair.split('/')[1]}` : 'MYR / USD'}
          value={fx.data ? fx.data.rate.toFixed(2) : undefined}
          isLoading={fx.isLoading}
          isError={fx.isError}
          Icon={Coins}
          tone="gold"
          index={0}
        />
        <StatTile
          label="Rail ridership · daily"
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
          value={fuel.data?.ron95 ? `RM ${fuel.data.ron95.toFixed(2)}` : undefined}
          isLoading={fuel.isLoading}
          isError={fuel.isError}
          Icon={CloudRain}
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
              ? `Malaysians made ${formatNumber(ridership.data.totalRail)} rail trips on ${ridership.data.asOf}.`
              : 'Penang has the highest population density in Malaysia — 1,659 people per km².'
          }
          source="data.gov.my · Prasarana ridership"
        />
      </View>
    </ScreenScroll>
  );
}
