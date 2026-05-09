export const API_BASES = {
  dataGovMy: 'https://api.data.gov.my',
  bnm: 'https://api.bnm.gov.my/public',
  metMalaysia: 'https://api.met.gov.my/v2.1',
} as const;

export type ApiBase = keyof typeof API_BASES;

export type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  base?: ApiBase;
  headers?: Record<string, string>;
}

export async function apiGet<T>(
  path: string,
  params: QueryParams = {},
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = API_BASES[options.base ?? 'dataGovMy'];
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json', ...options.headers },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} ${response.statusText} for ${url.pathname}`);
  }

  return (await response.json()) as T;
}
