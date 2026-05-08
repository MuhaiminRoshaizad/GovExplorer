const BASE_URL = 'https://api.data.gov.my';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export async function apiGet<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} ${response.statusText} for ${url.pathname}`);
  }

  return (await response.json()) as T;
}
