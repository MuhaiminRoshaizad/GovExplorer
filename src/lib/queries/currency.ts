import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type Code = 'usd' | 'sgd' | 'eur' | 'gbp' | 'jpy' | 'cny' | 'aud';

type DailyRow = {
  date: string;
  rate_type: 'buying' | 'middle' | 'selling';
} & Partial<Record<Code, number | null>>;

export type CurrencyLatest = {
  pair: string;
  rate: number;
  previousRate: number | null;
  delta: number | null;
  asOf: string;
};

export type CurrencyPoint = { date: string; rate: number };

const HOUR = 60 * 60 * 1000;

function pickRate(row: DailyRow, code: Code): number | null {
  const v = row[code];
  return typeof v === 'number' ? v : null;
}

export function useCurrencyLatestQuery(code: Code = 'usd') {
  return useQuery({
    queryKey: ['exchangerates_daily_1700', 'latest', code],
    queryFn: ({ signal }) =>
      apiGet<DailyRow[]>(
        Endpoints.catalogue,
        { id: 'exchangerates_daily_1700', limit: 9, sort: '-date' },
        signal
      ),
    select: (rows): CurrencyLatest | null => {
      const middle = rows.filter((r) => r.rate_type === 'middle');
      const latest = middle[0];
      const previous = middle[1];
      if (!latest) return null;
      const rate = pickRate(latest, code);
      if (rate === null) return null;
      const prevRate = previous ? pickRate(previous, code) : null;
      return {
        pair: `${code.toUpperCase()} / MYR`,
        rate,
        previousRate: prevRate,
        delta: prevRate !== null ? rate - prevRate : null,
        asOf: latest.date,
      };
    },
    staleTime: HOUR,
  });
}

export function useCurrencyHistoryQuery(code: Code = 'usd', days = 30) {
  return useQuery({
    queryKey: ['exchangerates_daily_1700', 'history', code, days],
    queryFn: ({ signal }) =>
      apiGet<DailyRow[]>(
        Endpoints.catalogue,
        { id: 'exchangerates_daily_1700', limit: days * 3 + 6, sort: '-date' },
        signal
      ),
    select: (rows): CurrencyPoint[] => {
      const points = rows
        .filter((r) => r.rate_type === 'middle')
        .slice(0, days)
        .map((r) => ({ date: r.date, rate: pickRate(r, code) }))
        .filter((p): p is CurrencyPoint => p.rate !== null)
        .reverse();
      return points;
    },
    staleTime: HOUR,
  });
}
