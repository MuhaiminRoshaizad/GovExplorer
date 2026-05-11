import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type FuelRow = {
  date: string;
  series_type?: string;
  ron95?: number;
  ron97?: number;
  diesel?: number;
};

export type FuelLatest = {
  ron95: number | null;
  ron97: number | null;
  diesel: number | null;
  asOf: string;
};

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function useFuelPriceLatestQuery() {
  return useQuery({
    queryKey: ['fuelprice', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<FuelRow[]>(
        Endpoints.catalogue,
        { id: 'fuelprice', limit: 8, sort: '-date' },
        signal
      ),
    select: (rows): FuelLatest | null => {
      const level =
        rows.find((r) => r.series_type === 'level') ?? rows[0];
      if (!level) return null;
      return {
        ron95: level.ron95 ?? null,
        ron97: level.ron97 ?? null,
        diesel: level.diesel ?? null,
        asOf: level.date,
      };
    },
    staleTime: SIX_HOURS,
  });
}
