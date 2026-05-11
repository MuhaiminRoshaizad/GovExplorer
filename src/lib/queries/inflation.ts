import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type InflationRow = {
  date: string;
  overall?: number;
  inflation_yoy?: number;
  inflation_mom?: number;
};

export type InflationLatest = {
  yoy: number;
  asOf: string;
};

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function useInflationLatestQuery() {
  return useQuery({
    queryKey: ['inflation', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<InflationRow[]>(
        Endpoints.catalogue,
        { id: 'cpi_headline', limit: 1, sort: '-date' },
        signal
      ),
    select: (rows): InflationLatest | null => {
      const latest = rows[0];
      if (!latest) return null;
      const yoy = latest.inflation_yoy ?? latest.overall ?? null;
      if (yoy === null) return null;
      return { yoy, asOf: latest.date };
    },
    staleTime: SIX_HOURS,
  });
}
