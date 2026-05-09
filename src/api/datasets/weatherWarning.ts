import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface WeatherWarningRow {
  warning_issue: { issued: string; title_en: string; title_bm: string };
  heading_en: string;
  heading_bm: string;
  text_en: string;
  text_bm: string;
  instruction_en: string | null;
  instruction_bm: string | null;
  valid_from: string;
  valid_to: string;
}

const QUERY_KEY = ['weather', 'warning'] as const;
const STALE_15M = 15 * 60 * 1000;

async function fetchWarnings(): Promise<WeatherWarningRow[]> {
  const rows = await apiGet<WeatherWarningRow[]>('/weather/warning/', {
    sort: '-warning_issue__issued',
    limit: 5,
  });
  const now = Date.now();
  return rows.filter((r) => {
    const validTo = new Date(r.valid_to).getTime();
    return Number.isFinite(validTo) ? validTo > now : true;
  });
}

export function useWeatherWarningQuery(): UseQueryResult<WeatherWarningRow[]> {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWarnings,
    staleTime: STALE_15M,
  });
}
