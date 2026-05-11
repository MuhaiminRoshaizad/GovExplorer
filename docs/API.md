# API

How GovExplorer talks to `api.data.gov.my`.

---

## Base

```
https://api.data.gov.my
```

Public. No API key required. Rate-limit is generous but not unlimited — be considerate.

---

## Client

**File:** `src/lib/api.ts`

```ts
import { apiGet, ApiError, Endpoints } from '@/lib/api';

const json = await apiGet<MyResponse>(Endpoints.catalogue, { id: 'fuelprice' });
```

- One helper (`apiGet`). One error type (`ApiError`).
- `Accept: application/json` is set by default.
- Query params: pass an object — `undefined` / `null` values are skipped.
- AbortSignal supported for cancellation (TanStack Query passes one).

---

## Query hooks

Conventions for query hooks under `src/features/<feature>/api/`:

```ts
import { useQuery } from '@tanstack/react-query';
import { apiGet, Endpoints } from '@/lib/api';

type FuelPriceResponse = {
  data: Array<{ date: string; ron95: number; ron97: number; diesel: number }>;
};

export type FuelPriceLatest = {
  ron95: number;
  ron97: number;
  diesel: number;
  asOf: string;
};

export function useFuelPriceLatestQuery() {
  return useQuery({
    queryKey: ['fuel-price', 'latest'],
    queryFn: ({ signal }) =>
      apiGet<FuelPriceResponse>(Endpoints.catalogue, { id: 'fuelprice', limit: 1, sort: '-date' }, signal),
    select: (raw): FuelPriceLatest | null => {
      const row = raw.data[0];
      if (!row) return null;
      return { ron95: row.ron95, ron97: row.ron97, diesel: row.diesel, asOf: row.date };
    },
  });
}
```

**Rules:**
- One hook per logical view-shape, not one per HTTP endpoint.
- Always type both the raw response (`FuelPriceResponse`) and the view shape (`FuelPriceLatest`).
- Parse in `select` so the component never sees raw API shapes.
- `queryKey` is a stable, hand-typed tuple — start with the feature, then the variant.
- Don't catch errors here; let them flow through `isError`.

---

## Caching defaults

Configured in `src/lib/queryClient.ts`:

| Default | Value |
|---|---|
| `staleTime` | 5 min |
| `gcTime` | 30 min |
| `retry` | 2 |
| `refetchOnWindowFocus` | `false` |

Per-query overrides are fine when the dataset's natural cadence is slower (e.g. monthly inflation prints don't need 5-min staleness — bump to `staleTime: 6 * 60 * 60 * 1000`).

---

## Cadence honesty

A non-negotiable: every dataset is surfaced at its publishing agency's native frequency. If DOSM publishes monthly, show it monthly. Do not interpolate, do not "show as daily." The `asOf` field on every parsed shape is mandatory and rendered visibly.

---

## GTFS-Realtime

`api.data.gov.my` exposes Protobuf at `/gtfs-realtime/vehicle-position/{provider}`. For v1.2:

```
Endpoints.gtfsVehicles('prasarana')
Endpoints.gtfsVehicles('mybas-johor')
```

These return `application/octet-stream` — parse with `protobufjs` against the GTFS-Realtime schema. v1 does not ship GTFS yet.

---

## Endpoints we use (v1.1 plan)

| Feature | `id` | Frequency |
|---|---|---|
| Today — currency | `exchangerates` | Daily |
| Today — ridership | `ridership_headline` | Daily |
| Today — weather | OpenWeather via DOSM mirror (TBD) | Hourly |
| Insights — fuel | `fuelprice` | Weekly |
| Insights — inflation | `cpi_headline` | Monthly |
| Insights — population | `population_state` | Annual |
| Insights — rainfall | `weather_warning` / `rainfall` | Daily |

The catalogue index is `Endpoints.catalogue` — keyed by `id`. The full `id` list lives in [DATA_SOURCES.md](DATA_SOURCES.md).
