import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type FuelRow = {
  date: string;
  series_type: 'level' | 'change_weekly';
  ron95?: number | null;
  ron97?: number | null;
  diesel?: number | null;
};

export type FuelLatest = {
  ron95: number | null;
  ron97: number | null;
  diesel: number | null;
  weeklyDeltaRon95: number | null;
  asOf: string;
};

export type FuelPoint = {
  date: string;
  ron95: number;
  ron97: number;
  diesel: number;
};

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function useFuelPriceLatestQuery() {
  return useQuery({
    queryKey: ['fuelprice', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<FuelRow[]>(
        Endpoints.catalogue,
        { id: 'fuelprice', limit: 4, sort: '-date' },
        signal
      ),
    select: (rows): FuelLatest | null => {
      const level = rows.find((r) => r.series_type === 'level');
      const change = rows.find((r) => r.series_type === 'change_weekly');
      if (!level) return null;
      return {
        ron95: level.ron95 ?? null,
        ron97: level.ron97 ?? null,
        diesel: level.diesel ?? null,
        weeklyDeltaRon95: change?.ron95 ?? null,
        asOf: level.date,
      };
    },
    staleTime: SIX_HOURS,
  });
}

export function useFuelPriceHistoryQuery(weeks = 26) {
  return useQuery({
    queryKey: ['fuelprice', 'history', weeks],
    queryFn: ({ signal }) =>
      apiGet<FuelRow[]>(
        Endpoints.catalogue,
        { id: 'fuelprice', limit: weeks * 2 + 4, sort: '-date' },
        signal
      ),
    select: (rows): FuelPoint[] => {
      return rows
        .filter((r) => r.series_type === 'level')
        .slice(0, weeks)
        .map((r) => ({
          date: r.date,
          ron95: r.ron95 ?? 0,
          ron97: r.ron97 ?? 0,
          diesel: r.diesel ?? 0,
        }))
        .reverse();
    },
    staleTime: SIX_HOURS,
  });
}
