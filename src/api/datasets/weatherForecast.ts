import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface WeatherForecastRow {
  date: string;
  location: { location_id: string; location_name: string };
  morning_forecast: string;
  afternoon_forecast: string;
  night_forecast: string;
  summary_when: string;
  summary_forecast: string;
  min_temp: number;
  max_temp: number;
}

const QUERY_KEY = ['weather', 'forecast'] as const;
const STALE_30M = 30 * 60 * 1000;

async function fetchForecast(locationId: string): Promise<WeatherForecastRow[]> {
  const rows = await apiGet<WeatherForecastRow[]>('/weather/forecast/', {
    contains: `${locationId}@location__location_id`,
    sort: 'date',
    limit: 7,
  });
  return rows;
}

export function useWeatherForecastQuery(
  locationId: string,
): UseQueryResult<WeatherForecastRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, locationId],
    queryFn: () => fetchForecast(locationId),
    staleTime: STALE_30M,
    enabled: Boolean(locationId),
  });
}
