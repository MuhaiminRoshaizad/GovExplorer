import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocales } from 'expo-localization';
import { useSetting } from '@/hooks/useSetting';
import { en, type Dictionary } from './en';
import { ms } from './ms';

export type Language = 'en' | 'ms';
export type LanguageOverride = Language | 'auto';

const DICTS: Record<Language, Dictionary> = { en, ms };

type Leaves<T> = T extends string
  ? ''
  : {
      [K in keyof T & string]: Leaves<T[K]> extends infer R
        ? R extends ''
          ? K
          : `${K}.${R & string}`
        : never;
    }[keyof T & string];
type TranslationKey = Leaves<Dictionary>;

function lookup(dict: Dictionary, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return key;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : key;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

interface I18nContextValue {
  language: Language;
  override: LanguageOverride;
  setOverride: (next: LanguageOverride) => Promise<void>;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useSetting<LanguageOverride>('language', 'auto');
  const locales = useLocales();
  const deviceLanguage: Language = (locales[0]?.languageCode ?? 'en') === 'ms' ? 'ms' : 'en';

  const language: Language = override === 'auto' ? deviceLanguage : override;

  const t = useCallback<I18nContextValue['t']>(
    (key, vars) => interpolate(lookup(DICTS[language], key), vars),
    [language],
  );

  const value = useMemo(() => ({ language, override, setOverride, t }), [
    language, override, setOverride, t,
  ]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
