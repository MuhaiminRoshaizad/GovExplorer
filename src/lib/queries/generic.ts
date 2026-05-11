import { useQuery } from '@tanstack/react-query';

import { apiGet, Endpoints } from '@/lib/api';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

type Row = Record<string, unknown>;

export type TimePoint = { date: string; value: number };
export type MultiSeriesPoint = { date: string; series: string; value: number };
export type CategoricalPoint = { name: string; value: number };

type SeriesCfg = {
  id: string;
  valueField: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
};

export function useTimeSeriesQuery(cfg: SeriesCfg) {
  return useQuery({
    queryKey: ['ts', cfg.id, cfg.filterField ?? '', cfg.filterValue ?? '', cfg.valueField],
    queryFn: ({ signal }) =>
      apiGet<Row[]>(
        Endpoints.catalogue,
        { id: cfg.id, limit: cfg.limit ?? 90, sort: '-date' },
        signal
      ),
    select: (rows): TimePoint[] => {
      let filtered = rows;
      if (cfg.filterField && cfg.filterValue !== undefined) {
        filtered = rows.filter((r) => r[cfg.filterField!] === cfg.filterValue);
      }
      return filtered
        .map((r) => ({ date: String(r.date), value: Number(r[cfg.valueField]) }))
        .filter((p) => Number.isFinite(p.value))
        .reverse();
    },
    staleTime: SIX_HOURS,
  });
}

type MultiSeriesCfg = {
  id: string;
  valueField: string;
  seriesField: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
};

export function useMultiSeriesQuery(cfg: MultiSeriesCfg) {
  return useQuery({
    queryKey: ['mts', cfg.id, cfg.seriesField, cfg.filterField ?? '', cfg.filterValue ?? ''],
    queryFn: ({ signal }) =>
      apiGet<Row[]>(
        Endpoints.catalogue,
        { id: cfg.id, limit: cfg.limit ?? 500, sort: '-date' },
        signal
      ),
    select: (rows): MultiSeriesPoint[] => {
      let filtered = rows;
      if (cfg.filterField && cfg.filterValue !== undefined) {
        filtered = rows.filter((r) => r[cfg.filterField!] === cfg.filterValue);
      }
      return filtered
        .map((r) => ({
          date: String(r.date),
          series: String(r[cfg.seriesField]),
          value: Number(r[cfg.valueField]),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse();
    },
    staleTime: SIX_HOURS,
  });
}

type CategoricalCfg = {
  id: string;
  valueField: string;
  categoryField: string;
  filterField?: string;
  filterValue?: string;
  excludeNames?: string[];
};

export function useCategoricalSnapshotQuery(cfg: CategoricalCfg) {
  return useQuery({
    queryKey: [
      'cat',
      cfg.id,
      cfg.categoryField,
      cfg.filterField ?? '',
      cfg.filterValue ?? '',
      cfg.excludeNames?.join(',') ?? '',
    ],
    queryFn: ({ signal }) =>
      apiGet<Row[]>(
        Endpoints.catalogue,
        { id: cfg.id, limit: 500, sort: '-date' },
        signal
      ),
    select: (rows): { asOf: string; points: CategoricalPoint[] } | null => {
      const latestDate = rows[0]?.date;
      if (!latestDate) return null;
      let filtered = rows.filter((r) => r.date === latestDate);
      if (cfg.filterField && cfg.filterValue !== undefined) {
        filtered = filtered.filter((r) => r[cfg.filterField!] === cfg.filterValue);
      }
      const excludeSet = new Set(cfg.excludeNames ?? []);
      const points = filtered
        .map((r) => ({
          name: String(r[cfg.categoryField] ?? ''),
          value: Number(r[cfg.valueField]),
        }))
        .filter((p) => Number.isFinite(p.value) && p.value !== 0 && !excludeSet.has(p.name))
        .sort((a, b) => b.value - a.value);
      return { asOf: String(latestDate), points };
    },
    staleTime: TWELVE_HOURS,
  });
}

type ScalarCfg = {
  id: string;
  valueField: string;
  filterField?: string;
  filterValue?: string;
};

export function useScalarLatestQuery(cfg: ScalarCfg) {
  return useQuery({
    queryKey: ['scalar', cfg.id, cfg.filterField ?? '', cfg.filterValue ?? '', cfg.valueField],
    queryFn: ({ signal }) =>
      apiGet<Row[]>(
        Endpoints.catalogue,
        { id: cfg.id, limit: 50, sort: '-date' },
        signal
      ),
    select: (rows): { value: number; asOf: string } | null => {
      let filtered = rows;
      if (cfg.filterField && cfg.filterValue !== undefined) {
        filtered = rows.filter((r) => r[cfg.filterField!] === cfg.filterValue);
      }
      const latest = filtered[0];
      if (!latest) return null;
      const v = Number(latest[cfg.valueField]);
      if (!Number.isFinite(v)) return null;
      return { value: v, asOf: String(latest.date) };
    },
    staleTime: TWELVE_HOURS,
  });
}
