import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

/**
 * Raw row from the data.gov.my exchangerates_daily_1200 endpoint.
 * The API returns wide-format data: one row per date with every currency
 * as its own column (lowercase ISO-4217 code). Null means no quote that day.
 * rate_type is always "middle" for this dataset (BNM 12:00 mid-rate fix).
 */
interface ExchangeRateRawRow {
  date: string;
  rate_type: string;
  aed: number | null;
  aud: number | null;
  bnd: number | null;
  cad: number | null;
  chf: number | null;
  cny: number | null;
  egp: number | null;
  eur: number | null;
  gbp: number | null;
  hkd: number | null;
  idr: number | null;
  inr: number | null;
  jpy: number | null;
  khr: number | null;
  krw: number | null;
  mmk: number | null;
  npr: number | null;
  nzd: number | null;
  php: number | null;
  pkr: number | null;
  sar: number | null;
  sgd: number | null;
  thb: number | null;
  twd: number | null;
  usd: number | null;
  vnd: number | null;
  xdr: number | null;
}

/**
 * Tall-format row exposed to consumers.
 * currency_code is uppercase (e.g. "USD", "SGD") to match common usage.
 * rate is MYR per 1 unit of the foreign currency.
 */
export interface ExchangeRateRow {
  date: string;
  currency_code: string;
  rate: number;
}

const QUERY_KEY = ['datasets', 'exchangerates_daily_1200'] as const;
const STALE_6H = 6 * 60 * 60 * 1000;

/**
 * Pivots wide-format API rows into tall-format ExchangeRateRow records,
 * keeping only currencies in the requested list and dropping null quotes.
 */
function pivot(
  rawRows: ExchangeRateRawRow[],
  currencies: string[],
): ExchangeRateRow[] {
  const lowerCurrencies = currencies.map((c) => c.toLowerCase());
  const result: ExchangeRateRow[] = [];

  for (const row of rawRows) {
    for (const lowerCode of lowerCurrencies) {
      const rate = (row as unknown as Record<string, number | null | string>)[lowerCode];
      if (typeof rate === 'number' && rate !== null) {
        result.push({
          date: row.date,
          currency_code: lowerCode.toUpperCase(),
          rate,
        });
      }
    }
  }

  return result;
}

async function fetchExchangeRates(currencies: string[]): Promise<ExchangeRateRow[]> {
  // Fetch enough rows to cover ~30 trading days per currency.
  // The dataset has one row per calendar date so 45 rows covers ~30 business days.
  const rawRows = await apiGet<ExchangeRateRawRow[]>('/data-catalogue', {
    id: 'exchangerates_daily_1200',
    sort: '-date',
    limit: 45,
  });
  return pivot(rawRows, currencies);
}

export function useExchangeRateQuery(
  currencies: string[] = ['USD', 'SGD'],
): UseQueryResult<ExchangeRateRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, currencies.join(',')],
    queryFn: () => fetchExchangeRates(currencies),
    staleTime: STALE_6H,
  });
}
