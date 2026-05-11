import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type RidershipRow = {
  date: string;
  bus_rkl?: number;
  bus_rkn?: number;
  bus_rpn?: number;
  rail_ets?: number;
  rail_lrt_kj?: number;
  rail_tebrau?: number;
  rail_komuter?: number;
  rail_komuter_utara?: number;
  rail_mrt_pjy?: number;
  rail_monorail?: number;
  rail_intercity?: number;
  rail_lrt_ampang?: number;
  rail_mrt_kajang?: number;
};

const RAIL_KEYS = [
  'rail_lrt_ampang',
  'rail_lrt_kj',
  'rail_mrt_kajang',
  'rail_mrt_pjy',
  'rail_monorail',
  'rail_ets',
  'rail_intercity',
  'rail_komuter',
  'rail_komuter_utara',
  'rail_tebrau',
] as const satisfies ReadonlyArray<keyof RidershipRow>;

const BUS_KEYS = ['bus_rkl', 'bus_rkn', 'bus_rpn'] as const satisfies ReadonlyArray<keyof RidershipRow>;

function sumKeys(row: RidershipRow, keys: ReadonlyArray<keyof RidershipRow>): number {
  return keys.reduce((acc, k) => acc + (Number(row[k]) || 0), 0);
}

export type RidershipLatest = {
  totalRail: number;
  totalBus: number;
  byService: Array<{ name: string; value: number }>;
  asOf: string;
};

export type RidershipPoint = { date: string; total: number };

const HOUR = 60 * 60 * 1000;

const SERVICE_LABELS: Record<string, string> = {
  rail_lrt_ampang: 'LRT Ampang',
  rail_lrt_kj: 'LRT Kelana Jaya',
  rail_mrt_kajang: 'MRT Kajang',
  rail_mrt_pjy: 'MRT Putrajaya',
  rail_monorail: 'Monorail',
  rail_ets: 'ETS',
  rail_intercity: 'Intercity',
  rail_komuter: 'KTM Komuter',
  rail_komuter_utara: 'Komuter Utara',
  rail_tebrau: 'Shuttle Tebrau',
  bus_rkl: 'Rapid KL Bus',
  bus_rkn: 'Rapid Kuantan Bus',
  bus_rpn: 'Rapid Penang Bus',
};

export function useRidershipLatestQuery() {
  return useQuery({
    queryKey: ['ridership_headline', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<RidershipRow[]>(
        Endpoints.catalogue,
        { id: 'ridership_headline', limit: 1, sort: '-date' },
        signal
      ),
    select: (rows): RidershipLatest | null => {
      const latest = rows[0];
      if (!latest) return null;
      const byService = [...RAIL_KEYS, ...BUS_KEYS]
        .map((k) => ({ name: SERVICE_LABELS[k] ?? k, value: Number(latest[k]) || 0 }))
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value);
      return {
        totalRail: sumKeys(latest, RAIL_KEYS),
        totalBus: sumKeys(latest, BUS_KEYS),
        byService,
        asOf: latest.date,
      };
    },
    staleTime: HOUR,
  });
}

export function useRidershipHistoryQuery(days = 30) {
  return useQuery({
    queryKey: ['ridership_headline', 'history', days],
    queryFn: ({ signal }) =>
      apiGet<RidershipRow[]>(
        Endpoints.catalogue,
        { id: 'ridership_headline', limit: days, sort: '-date' },
        signal
      ),
    select: (rows): RidershipPoint[] => {
      return rows
        .map((r) => ({ date: r.date, total: sumKeys(r, RAIL_KEYS) }))
        .reverse();
    },
    staleTime: HOUR,
  });
}
