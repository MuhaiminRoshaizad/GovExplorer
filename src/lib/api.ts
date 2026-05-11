const BASE_URL = 'https://api.data.gov.my';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
  signal?: AbortSignal
): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status}) ${url}`, res.status);
  }
  return (await res.json()) as T;
}

export const Endpoints = {
  // OpenDOSM/data.gov.my use a unified `data-catalogue` endpoint keyed by `id`.
  catalogue: '/data-catalogue',
  // Realtime GTFS vehicle positions
  gtfsVehicles: (provider: 'prasarana' | 'mybas-johor') =>
    `/gtfs-realtime/vehicle-position/${provider}`,
} as const;
