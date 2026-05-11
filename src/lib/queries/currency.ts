import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type CurrencyRow = {
  date: string;
  currency_code?: string;
  currency?: string;
  rate?: number;
  buying_rate?: number;
  selling_rate?: number;
};

export type CurrencyLatest = {
  pair: string;
  rate: number;
  previousRate: number | null;
  delta: number | null;
  asOf: string;
};

export type CurrencyPoint = { date: string; rate: number };

const HOUR = 60 * 60 * 1000;

function pickRate(row: CurrencyRow): number | null {
  if (typeof row.rate === 'number') return row.rate;
  if (typeof row.buying_rate === 'number' && typeof row.selling_rate === 'number') {
    return (row.buying_rate + row.selling_rate) / 2;
  }
  if (typeof row.buying_rate === 'number') return row.buying_rate;
  if (typeof row.selling_rate === 'number') return row.selling_rate;
  return null;
}

function matchesCode(row: CurrencyRow, code: string): boolean {
  const lower = code.toLowerCase();
  return (
    row.currency_code?.toLowerCase() === lower ||
    row.currency?.toLowerCase() === lower
  );
}

export function useCurrencyLatestQuery(code: 'usd' | 'sgd' | 'eur' | 'gbp' = 'usd') {
  return useQuery({
    queryKey: ['currency', 'latest', code],
    queryFn: ({ signal }) =>
      apiGet<CurrencyRow[]>(
        Endpoints.catalogue,
        { id: 'currency', limit: 200, sort: '-date' },
        signal
      ),
    select: (rows): CurrencyLatest | null => {
      const matches = rows.filter((r) => matchesCode(r, code));
      const latest = matches[0];
      const previous = matches[1];
      if (!latest) return null;
      const rate = pickRate(latest);
      if (rate === null) return null;
      const prevRate = previous ? pickRate(previous) : null;
      return {
        pair: `MYR/${code.toUpperCase()}`,
        rate,
        previousRate: prevRate,
        delta: prevRate !== null ? rate - prevRate : null,
        asOf: latest.date,
      };
    },
    staleTime: HOUR,
  });
}

export function useCurrencyHistoryQuery(code: 'usd' | 'sgd' | 'eur' | 'gbp' = 'usd', days = 30) {
  return useQuery({
    queryKey: ['currency', 'history', code, days],
    queryFn: ({ signal }) =>
      apiGet<CurrencyRow[]>(
        Endpoints.catalogue,
        { id: 'currency', limit: 1500, sort: '-date' },
        signal
      ),
    select: (rows): CurrencyPoint[] => {
      const points = rows
        .filter((r) => matchesCode(r, code))
        .map((r) => ({ date: r.date, rate: pickRate(r) }))
        .filter((p): p is CurrencyPoint => p.rate !== null)
        .slice(0, days)
        .reverse();
      return points;
    },
    staleTime: HOUR,
  });
}
