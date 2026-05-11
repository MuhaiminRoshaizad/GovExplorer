import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

type PopRow = {
  date: string;
  state: string;
  sex: string;
  age: string;
  ethnicity: string;
  population: number;
};

export type PopulationLatest = {
  total: number;
  asOf: string;
  byState: Array<{ state: string; population: number }>;
};

const DAY = 24 * 60 * 60 * 1000;

const NATIONAL_STATE_LABEL = 'Malaysia';

export function usePopulationLatestQuery() {
  return useQuery({
    queryKey: ['population_state', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<PopRow[]>(
        Endpoints.catalogue,
        { id: 'population_state', limit: 2000, sort: '-date' },
        signal
      ),
    select: (rows): PopulationLatest | null => {
      const latestDate = rows[0]?.date;
      if (!latestDate) return null;
      const latest = rows.filter(
        (r) =>
          r.date === latestDate &&
          r.age === 'overall_age' &&
          r.sex === 'overall_sex' &&
          r.ethnicity === 'overall_ethnicity'
      );
      const byState = latest
        .filter((r) => r.state !== NATIONAL_STATE_LABEL)
        .map((r) => ({ state: r.state, population: r.population }))
        .sort((a, b) => b.population - a.population);
      const total =
        latest.find((r) => r.state === NATIONAL_STATE_LABEL)?.population ??
        byState.reduce((acc, s) => acc + s.population, 0);
      return { total, asOf: latestDate, byState };
    },
    staleTime: 7 * DAY,
  });
}
