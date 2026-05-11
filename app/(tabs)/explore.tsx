import { router } from 'expo-router';
import { ArrowUpRight, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenEnter } from '@/components/system/ScreenEnter';
import { Card, ScreenScroll, Stack, Tap, Text } from '@/components/ui';
import { useStatePref } from '@/data/StateContext';
import { STATES } from '@/data/states';
import { StateTile } from '@/features/explore/StateTile';
import { useI18n } from '@/i18n';
import { formatCompact } from '@/lib/format';
import { usePopulationLatestQuery } from '@/lib/queries';
import { R, S } from '@/theme';
import { useTheme } from '@/theme';

export default function Explore() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state: userState } = useStatePref();
  const pop = usePopulationLatestQuery();

  const byStateMap: Record<string, number> = {};
  for (const r of pop.data?.byState ?? []) {
    byStateMap[r.state] = r.population;
  }

  const userPopulation = byStateMap[userState.apiName];

  return (
    <ScreenScroll>
      <ScreenEnter>
        <View style={{ marginTop: S.md }}>
          <Text variant="hero">{t.explore.title}</Text>
          <Text variant="bodyLg" tone="soft" style={{ marginTop: S.xs }}>
            {t.explore.subtitle}
          </Text>
        </View>

        <Tap
          haptic="light"
          onPress={() => router.push(`/state/${userState.code}` as never)}
          style={{ marginTop: S.xl }}
        >
          <Card
            variant="flat"
            padding={S.lg}
            radius={R.xxl}
            style={{ backgroundColor: theme.accent.glow }}
          >
            <Stack direction="row" align="center" gap={S.md}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: R.lg,
                  backgroundColor: theme.accent.base,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="micro" style={{ color: theme.accent.base }}>
                  YOUR STATE
                </Text>
                <Text variant="h2" style={{ marginTop: 2 }}>
                  {userState.name}
                </Text>
                {userPopulation != null ? (
                  <Text variant="caption" tone="soft" style={{ marginTop: 2 }}>
                    {formatCompact(userPopulation * 1000)} people
                  </Text>
                ) : null}
              </View>
              <ArrowUpRight size={18} color={theme.accent.base} strokeWidth={2} />
            </Stack>
          </Card>
        </Tap>

        <Text
          variant="micro"
          tone="muted"
          style={{ marginTop: S.xxl, marginBottom: S.sm, marginLeft: S.xs }}
        >
          ALL 16 STATES & FEDERAL TERRITORIES
        </Text>

        <Stack gap={S.md}>
          {chunk(STATES, 3).map((row, i) => (
            <Stack key={i} direction="row" gap={S.md}>
              {row.map((s) => (
                <StateTile
                  key={s.code}
                  state={s}
                  population={byStateMap[s.apiName]}
                  isUser={s.code === userState.code}
                  isLoading={pop.isLoading}
                />
              ))}
              {row.length < 3
                ? Array.from({ length: 3 - row.length }).map((_, j) => (
                    <View key={`spacer-${j}`} style={{ flex: 1 }} />
                  ))
                : null}
            </Stack>
          ))}
        </Stack>

        <Text variant="caption" tone="muted" style={{ marginTop: S.xl, textAlign: 'center' }}>
          Population estimates · DOSM · {pop.data?.asOf ? new Date(pop.data.asOf).getFullYear() : ''}
        </Text>
      </ScreenEnter>
    </ScreenScroll>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
