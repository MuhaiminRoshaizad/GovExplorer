import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface RidershipHeadlineRow {
  date: string;
  // Rail — Kelana Jaya line (plan guessed rail_lrt_kj; actual name is rail_lrt_kj ✓)
  rail_lrt_kj: number | null;
  rail_lrt_ampang: number | null;
  rail_mrt_kajang: number | null;
  rail_mrt_pjy: number | null;
  rail_monorail: number | null;
  // KTM Komuter — plan guessed rail_ktm; actual names are rail_komuter + rail_komuter_utara
  rail_komuter: number | null;
  rail_komuter_utara: number | null;
  // Additional rail services not in the original plan
  rail_ets: number | null;
  rail_tebrau: number | null;
  rail_intercity: number | null;
  // Bus
  bus_rkl: number | null;
  bus_rkn: number | null;
  bus_rpn: number | null;
}

const QUERY_KEY = ['datasets', 'ridership_headline'] as const;
const STALE_6H = 6 * 60 * 60 * 1000;

async function fetchRidership(limit: number): Promise<RidershipHeadlineRow[]> {
  return apiGet<RidershipHeadlineRow[]>('/data-catalogue', {
    id: 'ridership_headline',
    sort: '-date',
    limit,
  });
}

export function useRidershipHeadlineQuery(
  limit = 30,
): UseQueryResult<RidershipHeadlineRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, limit],
    queryFn: () => fetchRidership(limit),
    staleTime: STALE_6H,
  });
}
