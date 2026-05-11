import { CloudRain, Coins, Train, Users } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenScroll, Stack } from '@/components/ui';
import { Greeting } from '@/features/today/Greeting';
import { PulseHero } from '@/features/today/PulseHero';
import { StatTile } from '@/features/today/StatTile';
import { SurpriseCard } from '@/features/today/SurpriseCard';
import { S } from '@/theme';

export default function Today() {
  return (
    <ScreenScroll>
      <Greeting streak={3} />

      <View style={{ marginTop: S.xl }}>
        <PulseHero valueLabel="32.7M" deltaLabel="+0.4% YoY · population estimate" />
      </View>

      <Stack direction="row" gap={S.md} style={{ marginTop: S.md }}>
        <StatTile
          label="MYR / USD"
          value="4.43"
          Icon={Coins}
          tone="gold"
          index={0}
        />
        <StatTile
          label="Rail ridership"
          value="1.27"
          unit="M / day"
          Icon={Train}
          tone="chart-blue"
          index={1}
        />
      </Stack>

      <Stack direction="row" gap={S.md} style={{ marginTop: S.md }}>
        <StatTile
          label="KL · partly cloudy"
          value="29°"
          Icon={CloudRain}
          tone="chart-teal"
          index={2}
        />
        <StatTile
          label="Unemployment"
          value="3.2%"
          Icon={Users}
          tone="accent"
          index={3}
        />
      </Stack>

      <View style={{ marginTop: S.xl }}>
        <SurpriseCard
          fact="Penang has the highest population density in Malaysia — 1,659 people per km²."
          source="DOSM · 2024 population estimates"
        />
      </View>
    </ScreenScroll>
  );
}
