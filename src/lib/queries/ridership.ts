import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type RidershipRow = {
  date: string;
  rail_lrt_ampang?: number;
  rail_lrt_kj?: number;
  rail_mrt_kajang?: number;
  rail_mrt_pjy?: number;
  rail_monorail?: number;
  rail_ets?: number;
  rail_intercity?: number;
  rail_komuter?: number;
  rail_tebrau?: number;
  bus_rapid_kl?: number;
  bus_rapid_penang?: number;
  bus_rapid_kuantan?: number;
};

export type RidershipLatest = {
  totalRail: number;
  asOf: string;
};

const HOUR = 60 * 60 * 1000;

const RAIL_KEYS = [
  'rail_lrt_ampang',
  'rail_lrt_kj',
  'rail_mrt_kajang',
  'rail_mrt_pjy',
  'rail_monorail',
  'rail_ets',
  'rail_intercity',
  'rail_komuter',
  'rail_tebrau',
] as const satisfies ReadonlyArray<keyof RidershipRow>;

function sumRail(row: RidershipRow): number {
  return RAIL_KEYS.reduce((acc, key) => acc + (Number(row[key]) || 0), 0);
}

export function useRidershipLatestQuery() {
  return useQuery({
    queryKey: ['ridership', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<RidershipRow[]>(
        Endpoints.catalogue,
        { id: 'ridership_headline', limit: 1, sort: '-date' },
        signal
      ),
    select: (rows): RidershipLatest | null => {
      const latest = rows[0];
      if (!latest) return null;
      return {
        totalRail: sumRail(latest),
        asOf: latest.date,
      };
    },
    staleTime: HOUR,
  });
}
