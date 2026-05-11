import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type CpiRow = {
  date: string;
  division: string;
  index: number;
};

export type InflationLatest = {
  yoy: number;
  mom: number | null;
  index: number;
  asOf: string;
};

export type InflationPoint = { date: string; yoy: number };

const SIX_HOURS = 6 * 60 * 60 * 1000;

function monthsAgoKey(d: string, months: number): string {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() - months);
  return dt.toISOString().slice(0, 10);
}

export function useInflationLatestQuery() {
  return useQuery({
    queryKey: ['cpi_headline', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<CpiRow[]>(
        Endpoints.catalogue,
        { id: 'cpi_headline', limit: 200, sort: '-date' },
        signal
      ),
    select: (rows): InflationLatest | null => {
      const overall = rows.filter((r) => r.division === 'overall');
      const latest = overall[0];
      if (!latest) return null;
      const targetYoy = monthsAgoKey(latest.date, 12);
      const yearAgo = overall.find((r) => r.date === targetYoy);
      const monthAgo = overall[1];
      const yoy = yearAgo ? ((latest.index - yearAgo.index) / yearAgo.index) * 100 : 0;
      const mom = monthAgo ? ((latest.index - monthAgo.index) / monthAgo.index) * 100 : null;
      return {
        yoy,
        mom,
        index: latest.index,
        asOf: latest.date,
      };
    },
    staleTime: SIX_HOURS,
  });
}

export function useInflationHistoryQuery(months = 24) {
  return useQuery({
    queryKey: ['cpi_headline', 'history', months],
    queryFn: ({ signal }) =>
      apiGet<CpiRow[]>(
        Endpoints.catalogue,
        { id: 'cpi_headline', limit: 600, sort: '-date' },
        signal
      ),
    select: (rows): InflationPoint[] => {
      const overall = rows.filter((r) => r.division === 'overall').reverse();
      const points: InflationPoint[] = [];
      for (let i = 12; i < overall.length; i++) {
        const cur = overall[i];
        const prior = overall[i - 12];
        if (prior.index > 0) {
          points.push({
            date: cur.date,
            yoy: ((cur.index - prior.index) / prior.index) * 100,
          });
        }
      }
      return points.slice(-months);
    },
    staleTime: SIX_HOURS,
  });
}
