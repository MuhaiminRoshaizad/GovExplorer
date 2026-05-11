export function formatNumber(value: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-MY', opts).format(value);
}

export function formatCompact(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('en-MY', {
    notation: 'compact',
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCurrencyMYR(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'percent',
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatRelativeDate(iso: string, locale: 'en' | 'ms' = 'en'): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  const lang = locale === 'ms' ? 'ms-MY' : 'en-MY';
  if (diffMs < day) return new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' }).format(d);
  if (diffMs < 2 * day) return locale === 'ms' ? 'Semalam' : 'Yesterday';
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' }).format(d);
}
