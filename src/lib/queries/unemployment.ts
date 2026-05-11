import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type LfsRow = {
  date: string;
  lf: number;
  p_rate: number;
  u_rate: number;
  ep_ratio: number;
  lf_outside: number;
  lf_employed: number;
  lf_unemployed: number;
};

export type UnemploymentLatest = {
  uRate: number;
  pRate: number;
  employed: number;
  unemployed: number;
  asOf: string;
};

export type UnemploymentPoint = { date: string; rate: number };

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function useUnemploymentLatestQuery() {
  return useQuery({
    queryKey: ['lfs_month', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<LfsRow[]>(
        Endpoints.catalogue,
        { id: 'lfs_month', limit: 1, sort: '-date' },
        signal
      ),
    select: (rows): UnemploymentLatest | null => {
      const latest = rows[0];
      if (!latest) return null;
      return {
        uRate: latest.u_rate,
        pRate: latest.p_rate,
        employed: latest.lf_employed,
        unemployed: latest.lf_unemployed,
        asOf: latest.date,
      };
    },
    staleTime: SIX_HOURS,
  });
}

export function useUnemploymentHistoryQuery(months = 24) {
  return useQuery({
    queryKey: ['lfs_month', 'history', months],
    queryFn: ({ signal }) =>
      apiGet<LfsRow[]>(
        Endpoints.catalogue,
        { id: 'lfs_month', limit: months, sort: '-date' },
        signal
      ),
    select: (rows): UnemploymentPoint[] => {
      return rows
        .map((r) => ({ date: r.date, rate: r.u_rate }))
        .reverse();
    },
    staleTime: SIX_HOURS,
  });
}
