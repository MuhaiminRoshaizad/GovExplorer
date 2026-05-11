import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import { en, type Strings } from './en';
import { ms } from './ms';

export type Language = 'en' | 'ms';

const dictionaries: Record<Language, Strings> = { en, ms };

const STORAGE_KEY = 'govexplorer.language';

type Ctx = {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Strings;
};

const Ctx = createContext<Ctx | null>(null);

function detect(): Language {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode?.toLowerCase();
  return code === 'ms' || code === 'id' ? 'ms' : 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detect);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'ms') setLanguageState(stored);
    });
  }, []);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  };

  const value = useMemo<Ctx>(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
