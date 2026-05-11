import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type GdpRow = {
  date: string;
  series: 'abs' | 'growth_yoy' | 'growth_qoq';
  value: number;
};

export type GdpLatest = {
  abs: number;
  yoy: number;
  qoq: number | null;
  asOf: string;
};

export type GdpPoint = { date: string; yoy: number };

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export function useGdpLatestQuery() {
  return useQuery({
    queryKey: ['gdp_qtr_nominal', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<GdpRow[]>(
        Endpoints.catalogue,
        { id: 'gdp_qtr_nominal', limit: 6, sort: '-date' },
        signal
      ),
    select: (rows): GdpLatest | null => {
      const latestDate = rows[0]?.date;
      if (!latestDate) return null;
      const sameQuarter = rows.filter((r) => r.date === latestDate);
      const abs = sameQuarter.find((r) => r.series === 'abs');
      const yoy = sameQuarter.find((r) => r.series === 'growth_yoy');
      const qoq = sameQuarter.find((r) => r.series === 'growth_qoq');
      if (!abs || !yoy) return null;
      return {
        abs: abs.value,
        yoy: yoy.value,
        qoq: qoq?.value ?? null,
        asOf: latestDate,
      };
    },
    staleTime: TWELVE_HOURS,
  });
}

export function useGdpHistoryQuery(quarters = 12) {
  return useQuery({
    queryKey: ['gdp_qtr_nominal', 'history', quarters],
    queryFn: ({ signal }) =>
      apiGet<GdpRow[]>(
        Endpoints.catalogue,
        { id: 'gdp_qtr_nominal', limit: quarters * 3 + 3, sort: '-date' },
        signal
      ),
    select: (rows): GdpPoint[] => {
      return rows
        .filter((r) => r.series === 'growth_yoy')
        .slice(0, quarters)
        .map((r) => ({ date: r.date, yoy: r.value }))
        .reverse();
    },
    staleTime: TWELVE_HOURS,
  });
}
