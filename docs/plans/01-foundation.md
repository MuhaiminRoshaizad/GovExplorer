# Plan 01 — Foundation & Fuel Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing single-screen fuel price app onto the v1 architecture (`expo-router`, theme system, i18n, React Query, AsyncStorage) without losing any current functionality, and ship a working dataset-detail screen scaffold ready for charts in Plan 02.

**Architecture:** Move `App.tsx` + manual `useState` data flow to `expo-router` with `@tanstack/react-query`. Introduce a typed theme system (light + dark) and a hand-rolled BM/EN i18n layer, both backed by `AsyncStorage` for persistence. The existing fuel-price code becomes the reference implementation for the per-dataset query hook pattern. Charts (`victory-native`/Skia) and a custom dev client are intentionally deferred to Plan 02 so this plan stays runnable in Expo Go.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19.1, TypeScript, expo-router v6, @tanstack/react-query v5, @react-native-async-storage/async-storage v2, expo-font, lucide-react-native, react-native-svg.

**Spec reference:** `docs/design.md`

**Out of scope for this plan (deferred):**
- Charts (`victory-native`, `@shopify/react-native-skia`) → Plan 02
- Custom dev client / EAS Build → Plan 02
- Onboarding flow → Plan 02
- Catalogue, Saved, Settings tabs (only Home tab in this plan) → Plan 02
- Daily indicators, additional datasets → Plan 02
- Trending list, categories, search → Plan 03
- Tests (per spec: scaffolding deferred) → Plan 03

**Verification approach:** No automated tests in this plan (per spec decision). Each section ends with manual verification on the web build (`npx expo start --web`) and Expo Go. The fuel data must continue to render correctly throughout the migration — that's the regression check.

---

## File structure after this plan

```
GovExplorer/
├── app/                          # NEW — expo-router routes
│   ├── _layout.tsx               # root: providers (Query, Theme, I18n, SafeArea)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # tab bar (single Home tab in this plan)
│   │   └── index.tsx             # Home screen scaffold
│   └── dataset/
│       └── [id].tsx              # dataset detail (fuel only in this plan)
├── src/
│   ├── api/
│   │   ├── client.ts             # MODIFIED — accepts optional baseUrl
│   │   └── datasets/             # NEW
│   │       └── fuelPrice.ts      # MOVED from src/api/fuelPrices.ts; exports useFuelPriceQuery
│   ├── components/
│   │   ├── ui/                   # NEW — primitives
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── SectionHead.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── DataView.tsx
│   │   └── feature/              # NEW
│   │       ├── FuelLevelRow.tsx        # rebuilt PriceCard, theme-aware
│   │       └── FuelHistoryRow.tsx      # rebuilt PriceHistoryItem, theme-aware
│   ├── theme/                    # NEW
│   │   ├── tokens.ts             # lightTheme, darkTheme objects
│   │   ├── ThemeProvider.tsx     # provider + useTheme
│   │   └── typography.ts         # font scale + family names
│   ├── i18n/                     # NEW
│   │   ├── en.ts
│   │   ├── ms.ts
│   │   └── index.ts              # I18nProvider + useI18n + t()
│   ├── hooks/                    # NEW
│   │   └── useSetting.ts         # typed AsyncStorage hook
│   └── types/
│       └── fuelPrice.ts          # UNCHANGED
├── assets/
│   └── fonts/                    # NEW — Plus Jakarta Sans .ttf files
├── App.tsx                       # DELETED
├── index.ts                      # DELETED (replaced by expo-router/entry)
├── app.json                      # MODIFIED — add scheme, plugins
├── package.json                  # MODIFIED — main = expo-router/entry, deps
├── tsconfig.json                 # MODIFIED — add path aliases (@/*)
└── src/screens/                  # DELETED (folder)
```

Note: `src/components/PriceCard.tsx` and `src/components/PriceHistoryItem.tsx` are replaced by the theme-aware versions under `src/components/feature/` and deleted at the end of the plan.

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Expo-managed deps via `expo install` (handles SDK version pinning)**

Run:
```bash
cd C:\Users\aminm\Documents\Projects\GovExplorer
npx expo install expo-router expo-linking expo-constants expo-font expo-haptics react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-svg @react-native-async-storage/async-storage
```

Expected: each package added to `package.json` `dependencies` at the SDK 54-compatible version.

- [ ] **Step 2: Install non-Expo deps**

Run:
```bash
npm install @tanstack/react-query lucide-react-native
```

Expected: no peer-dependency warnings other than the standard React 19 noise.

- [ ] **Step 3: Verify the install**

Run:
```bash
npx expo doctor
```

Expected: "Didn't find any issues" or only warnings about app icons.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add foundation dependencies for v1 architecture

- expo-router for file-based routing
- @tanstack/react-query for server state
- async-storage for persistence
- expo-font, lucide-react-native, supporting native deps
- charts (victory-native/skia) deferred to plan 02"
```

---

## Task 2: Configure expo-router

**Files:**
- Modify: `package.json` (the `main` field)
- Modify: `app.json` (add `scheme`, plugins)
- Modify: `tsconfig.json` (path aliases)
- Delete: `index.ts`
- Delete: `App.tsx`

- [ ] **Step 1: Change the entry point in `package.json`**

In `package.json`, change:
```json
"main": "index.ts",
```
to:
```json
"main": "expo-router/entry",
```

- [ ] **Step 2: Add the `scheme` and the router plugin to `app.json`**

In `app.json`, inside the `expo` object, add (or merge with existing):
```json
{
  "expo": {
    "scheme": "govexplorer",
    "plugins": [
      "expo-router",
      "expo-font"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 3: Add path aliases to `tsconfig.json`**

Replace `tsconfig.json` with:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- [ ] **Step 4: Delete the old entry files**

Run:
```bash
rm App.tsx index.ts
```

- [ ] **Step 5: Verify the project still typechecks (no router files yet, expect "no entry route" error from Metro, that's fine — typecheck only)**

Run:
```bash
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add package.json app.json tsconfig.json App.tsx index.ts
git commit -m "chore: switch entry to expo-router and add path aliases

Sets main to expo-router/entry, registers the expo-router and expo-font
plugins, adds the govexplorer:// scheme, enables typedRoutes, and adds
the @/* alias for src/. Removes the old App.tsx + index.ts entry pair."
```

---

## Task 3: Theme tokens

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/theme/typography.ts`

- [ ] **Step 1: Create `src/theme/typography.ts`**

```ts
export const fonts = {
  display: 'PlusJakartaSans_700Bold',
  displayHeavy: 'PlusJakartaSans_800ExtraBold',
  body: undefined as string | undefined, // system default
  mono: undefined as string | undefined, // system default mono
};

export const fontSize = {
  screenTitle: 28,
  hero: 22,
  sectionHead: 18,
  body: 14,
  label: 12,
  monoCaps: 11,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
```

- [ ] **Step 2: Create `src/theme/tokens.ts`**

```ts
import { fonts, fontSize, fontWeight } from './typography';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
const radius = { sm: 8, md: 12, lg: 16, xl: 18, pill: 999 } as const;

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  codeBg: string;
  codeText: string;
}

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    bg: '#FBFAF7',
    bgAlt: '#F4F2EC',
    surface: '#FFFFFF',
    text: '#14181F',
    textMuted: '#5C6573',
    border: '#E8E5DD',
    primary: '#1E3A5F',
    primarySoft: '#E6ECF4',
    accent: '#B45309',
    accentSoft: '#FBEFD9',
    success: '#15803D',
    danger: '#B91C1C',
    codeBg: '#0B1220',
    codeText: '#D6DEEC',
  },
  spacing, radius, fonts, fontSize, fontWeight,
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    bg: '#0E1014',
    bgAlt: '#15181F',
    surface: '#181B22',
    text: '#F2F0EB',
    textMuted: '#8B92A1',
    border: '#232730',
    primary: '#7BA7D9',
    primarySoft: '#1A2434',
    accent: '#F59E0B',
    accentSoft: '#2A1F0E',
    success: '#22C55E',
    danger: '#EF4444',
    codeBg: '#0B1220',
    codeText: '#D6DEEC',
  },
  spacing, radius, fonts, fontSize, fontWeight,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/theme/tokens.ts src/theme/typography.ts
git commit -m "feat(theme): add Editorial-neutral light and dark theme tokens"
```

---

## Task 4: `useSetting` hook (AsyncStorage)

**Files:**
- Create: `src/hooks/useSetting.ts`

- [ ] **Step 1: Implement the hook**

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY_PREFIX = '@govexplorer:';

export function useSetting<T>(
  key: string,
  defaultValue: T,
): readonly [T, (next: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY_PREFIX + key).then((raw) => {
      if (cancelled) return;
      if (raw !== null) {
        try { setValue(JSON.parse(raw) as T); } catch { /* keep default */ }
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [key]);

  const update = useCallback(async (next: T) => {
    setValue(next);
    await AsyncStorage.setItem(KEY_PREFIX + key, JSON.stringify(next));
  }, [key]);

  return [value, update, loaded] as const;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSetting.ts
git commit -m "feat(hooks): add typed useSetting hook backed by AsyncStorage"
```

---

## Task 5: `ThemeProvider` and `useTheme`

**Files:**
- Create: `src/theme/ThemeProvider.tsx`

- [ ] **Step 1: Implement the provider**

```tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSetting } from '@/hooks/useSetting';
import { darkTheme, lightTheme, type Theme } from './tokens';

export type ThemeOverride = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  override: ThemeOverride;
  setOverride: (next: ThemeOverride) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useSetting<ThemeOverride>('theme', 'system');
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const resolved =
      override === 'system' ? (systemScheme ?? 'light') : override;
    return {
      theme: resolved === 'dark' ? darkTheme : lightTheme,
      override,
      setOverride,
    };
  }, [override, systemScheme, setOverride]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used inside <ThemeProvider>');
  return { override: ctx.override, setOverride: ctx.setOverride };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/ThemeProvider.tsx
git commit -m "feat(theme): add ThemeProvider with system + user-override resolution"
```

---

## Task 6: i18n system

**Files:**
- Create: `src/i18n/en.ts`
- Create: `src/i18n/ms.ts`
- Create: `src/i18n/index.tsx`

- [ ] **Step 1: Create `src/i18n/en.ts`**

```ts
export const en = {
  app: {
    name: 'GovExplorer',
    tagline: 'Explore Malaysian open data',
  },
  common: {
    retry: 'Retry',
    loading: 'Loading…',
    empty: 'Nothing to show yet',
    error: "Couldn't load",
    noConnection: 'No connection',
  },
  greeting: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  },
  home: {
    title: 'Explore Malaysia',
    featured: 'Featured',
  },
  cadence: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    annual: 'Annual',
  },
  fuel: {
    title: 'Fuel prices',
    subtitle: 'Weekly retail prices, Peninsular Malaysia',
    weekOf: 'Week of {date}',
    history: 'History',
    high: 'High',
    low: 'Low',
    avg: 'Avg',
    week: 'Week',
    ron95: 'RON 95',
    ron97: 'RON 97',
    diesel: 'Diesel',
    budi95: 'Budi95 subsidy: RM {value} / litre',
  },
};

export type Dictionary = typeof en;
```

> Note: `as const` is intentionally NOT applied. `Path<T>` (used in the provider) only walks `keyof T`, which preserves literal keys regardless. Adding `as const` would literalize the value strings too, which would force `ms: Dictionary` to use the exact English literals — defeating the entire point of having translations.

- [ ] **Step 2: Create `src/i18n/ms.ts`**

```ts
import type { Dictionary } from './en';

export const ms: Dictionary = {
  app: {
    name: 'GovExplorer',
    tagline: 'Jelajah data terbuka Malaysia',
  },
  common: {
    retry: 'Cuba lagi',
    loading: 'Memuatkan…',
    empty: 'Belum ada apa-apa',
    error: 'Gagal memuatkan',
    noConnection: 'Tiada sambungan',
  },
  greeting: {
    morning: 'Selamat pagi',
    afternoon: 'Selamat tengah hari',
    evening: 'Selamat petang',
  },
  home: {
    title: 'Jelajah data Malaysia',
    featured: 'Sorotan',
  },
  cadence: {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    annual: 'Tahunan',
  },
  fuel: {
    title: 'Harga minyak',
    subtitle: 'Harga runcit mingguan, Semenanjung Malaysia',
    weekOf: 'Minggu {date}',
    history: 'Sejarah',
    high: 'Tinggi',
    low: 'Rendah',
    avg: 'Purata',
    week: 'Minggu',
    ron95: 'RON 95',
    ron97: 'RON 97',
    diesel: 'Diesel',
    budi95: 'Subsidi Budi95: RM {value} / liter',
  },
};
```

- [ ] **Step 3: Create `src/i18n/index.tsx` (provider + `t()` + `useI18n`)**

```tsx
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useSetting } from '@/hooks/useSetting';
import { en, type Dictionary } from './en';
import { ms } from './ms';

export type Language = 'en' | 'ms';
export type LanguageOverride = Language | 'auto';

const DICTS: Record<Language, Dictionary> = { en, ms };

function detectDeviceLanguage(): Language {
  const locale =
    (Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier) ?? 'en-MY';
  return /^ms\b/i.test(locale) ? 'ms' : 'en';
}

type Path<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${Path<T[K]>}` : never }[keyof T]
  : never;
type TranslationKey = Path<Dictionary>;

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
  const language: Language =
    override === 'auto' ? detectDeviceLanguage() : override;

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
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n
git commit -m "feat(i18n): add hand-rolled BM/EN i18n with auto device detection"
```

---

## Task 7: Plus Jakarta Sans font loading

**Files:**
- Modify: `package.json` (add font package)
- Create: `src/theme/useAppFonts.ts`

- [ ] **Step 1: Install the Plus Jakarta Sans font package (Expo's bundled fonts)**

Run:
```bash
npx expo install @expo-google-fonts/plus-jakarta-sans
```

Expected: package added to dependencies.

- [ ] **Step 2: Create `src/theme/useAppFonts.ts`**

```ts
import {
  useFonts,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

export function useAppFonts() {
  const [loaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  return loaded;
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/theme/useAppFonts.ts
git commit -m "feat(theme): load Plus Jakarta Sans display font via expo-font"
```

---

## Task 8: Extend `apiGet` for multiple base URLs

**Files:**
- Modify: `src/api/client.ts`

- [ ] **Step 1: Replace `src/api/client.ts` with the multi-base version**

```ts
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
```

- [ ] **Step 2: Verify it typechecks**

Run:
```bash
npx tsc --noEmit
```

Expected: error in `src/api/fuelPrices.ts` referencing the old `apiGet` signature is OK — that file gets moved in Task 13. Other files: no new errors.

If you see errors elsewhere, the change is wrong; fix before committing.

- [ ] **Step 3: Commit**

```bash
git add src/api/client.ts
git commit -m "feat(api): extend apiGet with named base-URL option for BNM and MET"
```

---

## Task 9: UI primitives — Card, Chip, SectionHead, StatCard

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Chip.tsx`
- Create: `src/components/ui/SectionHead.tsx`
- Create: `src/components/ui/StatCard.tsx`

- [ ] **Step 1: Create `src/components/ui/Card.tsx`**

```tsx
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  padded?: boolean;
}

export function Card({ padded = true, style, children, ...rest }: CardProps) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
          padding: padded ? T.spacing.lg : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth },
});
```

- [ ] **Step 2: Create `src/components/ui/Chip.tsx`**

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  const T = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          borderColor: active ? T.colors.primary : T.colors.border,
          backgroundColor: active ? T.colors.primary : T.colors.surface,
        },
      ]}
    >
      <Text
        style={{
          color: active ? '#FFFFFF' : T.colors.text,
          fontSize: T.fontSize.body - 1,
          fontWeight: T.fontWeight.medium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
```

- [ ] **Step 3: Create `src/components/ui/SectionHead.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SectionHeadProps {
  titleMs: string;
  titleEn: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ titleMs, titleEn, action, onAction }: SectionHeadProps) {
  const T = useTheme();
  return (
    <View style={styles.row}>
      <View>
        <Text
          style={{
            fontFamily: T.fonts.display,
            fontSize: T.fontSize.sectionHead,
            color: T.colors.text,
            letterSpacing: -0.3,
          }}
        >
          {titleMs}
        </Text>
        <Text
          style={{
            fontSize: T.fontSize.monoCaps,
            color: T.colors.textMuted,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {titleEn}
        </Text>
      </View>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text
            style={{
              fontSize: T.fontSize.body - 1,
              color: T.colors.primary,
              fontWeight: T.fontWeight.semibold,
            }}
          >
            {action} ›
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
});
```

- [ ] **Step 4: Create `src/components/ui/StatCard.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  emphasis?: 'default' | 'positive' | 'negative';
}

export function StatCard({ label, value, sub, emphasis = 'default' }: StatCardProps) {
  const T = useTheme();
  const subColor =
    emphasis === 'positive'
      ? T.colors.success
      : emphasis === 'negative'
        ? T.colors.danger
        : T.colors.textMuted;
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
        },
      ]}
    >
      <Text
        style={{
          fontSize: T.fontSize.monoCaps,
          color: T.colors.textMuted,
          fontWeight: T.fontWeight.medium,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: T.fonts.displayHeavy,
          fontSize: T.fontSize.hero + 2,
          color: T.colors.text,
          marginTop: 4,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      {sub && (
        <Text
          style={{
            fontSize: T.fontSize.monoCaps,
            color: subColor,
            fontWeight: T.fontWeight.medium,
            marginTop: 2,
          }}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, padding: 14, borderWidth: StyleSheet.hairlineWidth, minWidth: 0 },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Chip.tsx src/components/ui/SectionHead.tsx src/components/ui/StatCard.tsx
git commit -m "feat(ui): add Card, Chip, SectionHead, StatCard primitives"
```

---

## Task 10: Skeleton + DataView wrapper

**Files:**
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/DataView.tsx`

- [ ] **Step 1: Create `src/components/ui/Skeleton.tsx`**

```tsx
import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = 6, style }: SkeletonProps) {
  const T = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius, backgroundColor: T.colors.bgAlt },
        animated,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({ base: {} });
```

- [ ] **Step 2: Create `src/components/ui/DataView.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

interface DataViewProps<T> {
  query: UseQueryResult<T>;
  renderLoading: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function DataView<T>({
  query,
  renderLoading,
  renderEmpty,
  isEmpty,
  children,
}: DataViewProps<T>) {
  const T_ = useTheme();
  const { t } = useI18n();

  if (query.isPending) return <>{renderLoading()}</>;

  if (query.isError) {
    return (
      <View style={styles.center}>
        <Text style={{
          fontSize: T_.fontSize.sectionHead,
          fontWeight: T_.fontWeight.semibold,
          color: T_.colors.danger,
        }}>
          {t('common.error')}
        </Text>
        <Text style={{
          marginTop: 6,
          fontSize: T_.fontSize.label,
          color: T_.colors.textMuted,
          textAlign: 'center',
        }}>
          {query.error instanceof Error ? query.error.message : ''}
        </Text>
        <Pressable
          onPress={() => query.refetch()}
          style={[
            styles.retry,
            { backgroundColor: T_.colors.primary, borderRadius: T_.radius.md },
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: T_.fontWeight.semibold }}>
            {t('common.retry')}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isEmpty?.(query.data) && renderEmpty) return <>{renderEmpty()}</>;

  return <>{children(query.data)}</>;
}

const styles = StyleSheet.create({
  center: { padding: 24, alignItems: 'center', gap: 4 },
  retry: { paddingVertical: 10, paddingHorizontal: 18, marginTop: 14 },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Skeleton.tsx src/components/ui/DataView.tsx
git commit -m "feat(ui): add shimmering Skeleton and DataView query-state wrapper"
```

---

## Task 11: Root layout with providers

**Files:**
- Create: `app/_layout.tsx`

- [ ] **Step 1: Create `app/_layout.tsx`**

```tsx
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { I18nProvider } from '@/i18n';
import { useAppFonts } from '@/theme/useAppFonts';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ThemedShell() {
  const T = useTheme();
  return (
    <>
      <StatusBar style={T.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: T.colors.bg },
          headerTintColor: T.colors.text,
          contentStyle: { backgroundColor: T.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dataset/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nProvider>
              <ThemedShell />
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: Install expo-splash-screen if not already pulled by deps**

Run:
```bash
npx expo install expo-splash-screen
```

Expected: already installed (it's a transitive of `expo`), or freshly added.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx package.json package-lock.json
git commit -m "feat(app): add root layout with Query, Theme, I18n providers"
```

---

## Task 12: Tabs layout + Home placeholder

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`

- [ ] **Step 1: Create `app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router';
import { House } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function TabsLayout() {
  const T = useTheme();
  const { language } = useI18n();
  const homeLabel = language === 'ms' ? 'Utama' : 'Home';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.colors.primary,
        tabBarInactiveTintColor: T.colors.textMuted,
        tabBarStyle: {
          backgroundColor: T.colors.surface,
          borderTopColor: T.colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: homeLabel,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

> Note: Plan 02 will add Catalogue, Saved, and Settings tab screens. The tab bar in this plan intentionally has only Home — `expo-router`'s `<Tabs>` only registers the screens that actually exist as files.

- [ ] **Step 2: Create `app/(tabs)/index.tsx` (Home placeholder)**

```tsx
import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { SectionHead } from '@/components/ui/SectionHead';

function timeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export default function HomeScreen() {
  const T = useTheme();
  const { t, language } = useI18n();
  const greetingKey = `greeting.${timeOfDay()}` as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: T.spacing.xl, gap: T.spacing.xl }}>
        <View>
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.body }}>
            {t(greetingKey)} 👋
          </Text>
          <Text
            style={{
              fontFamily: T.fonts.displayHeavy,
              fontSize: T.fontSize.screenTitle,
              color: T.colors.text,
              letterSpacing: -0.6,
              marginTop: 2,
            }}
          >
            {t('home.title')}
          </Text>
        </View>

        <View>
          <SectionHead
            titleMs={language === 'ms' ? 'Sorotan' : 'Featured'}
            titleEn="FEATURED"
          />
          <Link href="/dataset/fuelprice" asChild>
            <Card style={{ marginTop: T.spacing.md }}>
              <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>
                {t('cadence.weekly')} · KPDN
              </Text>
              <Text
                style={{
                  fontFamily: T.fonts.display,
                  fontSize: T.fontSize.hero,
                  color: T.colors.text,
                  marginTop: 4,
                }}
              >
                {t('fuel.title')}
              </Text>
              <Text style={{ color: T.colors.textMuted, marginTop: 4 }}>
                {t('fuel.subtitle')}
              </Text>
            </Card>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Manual verification — run on web first**

Run:
```bash
npx expo start --web
```

Expected: browser opens, Home screen shows greeting + featured fuel card. Tab bar visible at bottom with single "Home" tab. No console errors.

If you see "Plus Jakarta Sans not loaded" — confirm Task 7 ran successfully and the splash screen is hiding only after fonts load.

- [ ] **Step 4: Manual verification — run on Expo Go**

Run:
```bash
npx expo start
```

Scan QR with Expo Go. Confirm same screen, light + dark theme respect device setting (toggle device dark mode and reopen).

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)
git commit -m "feat(home): add tabs layout and Home placeholder with featured fuel card"
```

---

## Task 13: Migrate fuel API to a React Query hook

**Files:**
- Create: `src/api/datasets/fuelPrice.ts`
- Delete: `src/api/fuelPrices.ts`

- [ ] **Step 1: Create `src/api/datasets/fuelPrice.ts`**

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import type { FuelPriceRow, WeeklyFuelPrice } from '@/types/fuelPrice';

const QUERY_KEY = ['datasets', 'fuelprice'] as const;
const STALE_24H = 24 * 60 * 60 * 1000;

async function fetchWeeklyFuelPrices(limit: number): Promise<WeeklyFuelPrice[]> {
  const rows = await apiGet<FuelPriceRow[]>('/data-catalogue', {
    id: 'fuelprice',
    sort: '-date',
    limit: limit * 2,
  });

  const byDate = new Map<string, { level?: FuelPriceRow; change?: FuelPriceRow }>();
  for (const row of rows) {
    const bucket = byDate.get(row.date) ?? {};
    if (row.series_type === 'level') bucket.level = row;
    if (row.series_type === 'change_weekly') bucket.change = row;
    byDate.set(row.date, bucket);
  }

  const result: WeeklyFuelPrice[] = [];
  for (const [date, { level, change }] of byDate) {
    if (!level) continue;
    result.push({
      date,
      level: {
        ron95: level.ron95,
        ron97: level.ron97,
        diesel: level.diesel,
        diesel_eastmsia: level.diesel_eastmsia,
        ron95_skps: level.ron95_skps,
        ron95_budi95: level.ron95_budi95,
      },
      change: change
        ? { ron95: change.ron95, ron97: change.ron97, diesel: change.diesel }
        : null,
    });
  }
  return result.slice(0, limit);
}

export function useFuelPriceQuery(limit = 26): UseQueryResult<WeeklyFuelPrice[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, limit],
    queryFn: () => fetchWeeklyFuelPrices(limit),
    staleTime: STALE_24H,
  });
}
```

- [ ] **Step 2: Delete the old file**

Run:
```bash
rm src/api/fuelPrices.ts
```

- [ ] **Step 3: Verify the typecheck**

Run:
```bash
npx tsc --noEmit
```

Expected: error in `src/screens/FuelPriceScreen.tsx` referring to the deleted import — that's OK, that file is deleted in Task 16. No other errors.

- [ ] **Step 4: Commit**

```bash
git add src/api/datasets/fuelPrice.ts src/api/fuelPrices.ts
git commit -m "feat(api): convert fuel-price loader into useFuelPriceQuery hook"
```

---

## Task 14: Theme-aware fuel components (FuelLevelRow, FuelHistoryRow)

**Files:**
- Create: `src/components/feature/FuelLevelRow.tsx`
- Create: `src/components/feature/FuelHistoryRow.tsx`

- [ ] **Step 1: Create `src/components/feature/FuelLevelRow.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

interface FuelLevelRowProps {
  week: WeeklyFuelPrice;
}

export function FuelLevelRow({ week }: FuelLevelRowProps) {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <View>
      <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginBottom: 12 }}>
        {t('fuel.weekOf', { date: formatDate(week.date) })}
      </Text>
      <View style={styles.row}>
        <Cell name={t('fuel.ron95')} price={week.level.ron95} delta={week.change?.ron95} />
        <Cell name={t('fuel.ron97')} price={week.level.ron97} delta={week.change?.ron97} />
        <Cell name={t('fuel.diesel')} price={week.level.diesel} delta={week.change?.diesel} />
      </View>
      {week.level.ron95_budi95 !== null && (
        <Text
          style={{
            fontSize: T.fontSize.label,
            color: T.colors.success,
            marginTop: 14,
            textAlign: 'center',
          }}
        >
          {t('fuel.budi95', { value: week.level.ron95_budi95.toFixed(2) })}
        </Text>
      )}
    </View>
  );
}

interface CellProps {
  name: string;
  price: number;
  delta: number | undefined;
}

function Cell({ name, price, delta }: CellProps) {
  const T = useTheme();
  const arrow = delta === undefined || delta === 0 ? '·' : delta > 0 ? '▲' : '▼';
  const deltaColor =
    delta === undefined || delta === 0
      ? T.colors.textMuted
      : delta > 0
        ? T.colors.danger
        : T.colors.success;

  return (
    <View style={styles.cell}>
      <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginBottom: 4 }}>
        {name}
      </Text>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.hero - 2,
          color: T.colors.text,
        }}
      >
        RM {price.toFixed(2)}
      </Text>
      <Text
        style={{
          fontSize: T.fontSize.label,
          color: deltaColor,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {arrow} {delta !== undefined ? Math.abs(delta).toFixed(2) : '—'}
      </Text>
    </View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center' },
});
```

- [ ] **Step 2: Create `src/components/feature/FuelHistoryRow.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

interface FuelHistoryRowProps {
  week: WeeklyFuelPrice;
}

export function FuelHistoryRow({ week }: FuelHistoryRowProps) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.xl },
      ]}
    >
      <Text style={[styles.date, { color: T.colors.textMuted, fontSize: T.fontSize.body }]}>
        {formatShortDate(week.date)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.ron95.toFixed(2)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.ron97.toFixed(2)}
      </Text>
      <Text style={[styles.price, { color: T.colors.text, fontSize: T.fontSize.body }]}>
        {week.level.diesel.toFixed(2)}
      </Text>
    </View>
  );
}

export function FuelHistoryHeader() {
  const T = useTheme();
  const { t } = useI18n();
  const headerStyle = {
    color: T.colors.textMuted,
    fontWeight: T.fontWeight.semibold,
    fontSize: T.fontSize.label,
  } as const;
  return (
    <View
      style={[
        styles.row,
        styles.header,
        { backgroundColor: T.colors.bgAlt, borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.xl },
      ]}
    >
      <Text style={[styles.date, headerStyle]}>{t('fuel.week')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.ron95')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.ron97')}</Text>
      <Text style={[styles.price, headerStyle]}>{t('fuel.diesel')}</Text>
    </View>
  );
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: { borderBottomWidth: 1 },
  date: { flex: 2 },
  price: { flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/feature
git commit -m "feat(fuel): rebuild fuel level + history rows with theme + i18n"
```

---

## Task 15: Dataset detail screen (`app/dataset/[id].tsx`)

The detail screen handles `id=fuelprice` in this plan; other dataset ids will be added in later plans. No chart yet — that's Plan 02. Layout: hero stat card (latest week with `FuelLevelRow`), high/low/avg row of `StatCard`s, history list with `FlatList`.

**Files:**
- Create: `app/dataset/[id].tsx`

- [ ] **Step 1: Create `app/dataset/[id].tsx`**

```tsx
import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataView } from '@/components/ui/DataView';
import { useFuelPriceQuery } from '@/api/datasets/fuelPrice';
import { FuelLevelRow } from '@/components/feature/FuelLevelRow';
import { FuelHistoryHeader, FuelHistoryRow } from '@/components/feature/FuelHistoryRow';
import type { WeeklyFuelPrice } from '@/types/fuelPrice';

export default function DatasetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'fuelprice') return <FuelDetail />;
  return <UnknownDataset id={id ?? '(none)'} />;
}

function FuelDetail() {
  const T = useTheme();
  const { t } = useI18n();
  const query = useFuelPriceQuery(26);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <Header title={t('fuel.title')} />
      <DataView
        query={query}
        renderLoading={() => <FuelDetailSkeleton />}
      >
        {(weeks) => <FuelDetailBody weeks={weeks} onRefresh={query.refetch} refreshing={query.isFetching} />}
      </DataView>
    </SafeAreaView>
  );
}

interface FuelDetailBodyProps {
  weeks: WeeklyFuelPrice[];
  onRefresh: () => void;
  refreshing: boolean;
}

function FuelDetailBody({ weeks, onRefresh, refreshing }: FuelDetailBodyProps) {
  const T = useTheme();
  const { t } = useI18n();
  const [latest, ...history] = weeks;

  const stats = useMemo(() => {
    if (weeks.length === 0) return null;
    const ron95Values = weeks.map((w) => w.level.ron95);
    return {
      high: Math.max(...ron95Values),
      low: Math.min(...ron95Values),
      avg: ron95Values.reduce((a, b) => a + b, 0) / ron95Values.length,
    };
  }, [weeks]);

  return (
    <FlatList
      data={history}
      keyExtractor={(w) => w.date}
      renderItem={({ item }) => <FuelHistoryRow week={item} />}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: T.spacing.xl, paddingTop: T.spacing.lg, gap: T.spacing.lg }}>
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>
            {t('fuel.subtitle')} · {t('cadence.weekly')}
          </Text>
          {latest && <Card><FuelLevelRow week={latest} /></Card>}
          {stats && (
            <View style={{ flexDirection: 'row', gap: T.spacing.sm }}>
              <StatCard label={t('fuel.high')} value={`RM ${stats.high.toFixed(2)}`} />
              <StatCard label={t('fuel.low')} value={`RM ${stats.low.toFixed(2)}`} />
              <StatCard label={t('fuel.avg')} value={`RM ${stats.avg.toFixed(2)}`} />
            </View>
          )}
          <View>
            <Text
              style={{
                fontFamily: T.fonts.display,
                fontSize: T.fontSize.sectionHead,
                color: T.colors.text,
                marginBottom: T.spacing.sm,
              }}
            >
              {t('fuel.history')}
            </Text>
            <FuelHistoryHeader />
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={T.colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: T.spacing.xxxl }}
    />
  );
}

function FuelDetailSkeleton() {
  const T = useTheme();
  return (
    <View style={{ padding: T.spacing.xl, gap: T.spacing.lg }}>
      <Skeleton width="60%" height={14} />
      <Skeleton height={140} radius={T.radius.lg} />
      <View style={{ flexDirection: 'row', gap: T.spacing.sm }}>
        <Skeleton height={64} radius={T.radius.lg} />
        <Skeleton height={64} radius={T.radius.lg} />
        <Skeleton height={64} radius={T.radius.lg} />
      </View>
      <Skeleton height={300} radius={T.radius.md} />
    </View>
  );
}

function Header({ title }: { title: string }) {
  const T = useTheme();
  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: T.colors.border, paddingHorizontal: T.spacing.sm },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
        hitSlop={8}
      >
        <ChevronLeft size={24} color={T.colors.text} />
      </Pressable>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.sectionHead,
          color: T.colors.text,
        }}
      >
        {title}
      </Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function UnknownDataset({ id }: { id: string }) {
  const T = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <Header title={`Dataset: ${id}`} />
      <View style={{ padding: T.spacing.xl }}>
        <Text style={{ color: T.colors.textMuted }}>
          This dataset will be wired up in a later plan.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Verify typecheck and run on web**

Run:
```bash
npx tsc --noEmit
npx expo start --web
```

Expected:
- typecheck clean
- Home → tap "Fuel prices" featured card → routes to detail screen with hero card showing latest week, high/low/avg row, history list scrollable. Pull-to-refresh works.

- [ ] **Step 3: Verify on Expo Go**

Run:
```bash
npx expo start
```

Confirm both light and dark themes render correctly. Toggle device dark mode while on the detail screen — colors should switch live.

Switch device language to BM (System Settings → General → Language → Bahasa Melayu) and reopen — labels should be in BM.

- [ ] **Step 4: Commit**

```bash
git add app/dataset
git commit -m "feat(dataset): add detail screen scaffold wired to fuel prices"
```

---

## Task 16: Cleanup — delete old screens and components

**Files:**
- Delete: `src/screens/FuelPriceScreen.tsx`
- Delete: `src/screens/` (folder, if empty)
- Delete: `src/components/PriceCard.tsx`
- Delete: `src/components/PriceHistoryItem.tsx`

- [ ] **Step 1: Confirm none of the deleted files are referenced**

Run:
```bash
grep -rE "FuelPriceScreen|PriceCard|PriceHistoryItem" --include="*.ts" --include="*.tsx" src app
```

Expected: no output. If any references remain, fix them before deleting.

- [ ] **Step 2: Delete the old files and the empty folder**

Run:
```bash
rm src/screens/FuelPriceScreen.tsx
rmdir src/screens
rm src/components/PriceCard.tsx src/components/PriceHistoryItem.tsx
```

- [ ] **Step 3: Run the typecheck and the app one more time**

Run:
```bash
npx tsc --noEmit
npx expo start --web
```

Expected: clean typecheck, app works exactly the same as the end of Task 15.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete FuelPriceScreen and pre-theme components"
```

---

## Task 17: Final verification

**No code changes — purely a regression check on the migrated app before handing off.**

- [ ] **Step 1: Cold-start checklist on Expo Go**

Run:
```bash
npx expo start --clear
```

Walk through:
- [ ] App launches, splash hides only after fonts load (no flash of fallback font).
- [ ] Home screen shows greeting (correct time-of-day) + featured fuel card.
- [ ] Tap fuel card → detail screen routes correctly.
- [ ] Detail screen shows: hero week card, RON 95 / 97 / Diesel cells with delta arrows, Budi95 subsidy line if applicable, high/low/avg stat row, scrollable history list.
- [ ] Pull-to-refresh on detail screen works.
- [ ] Back button returns to Home.

- [ ] **Step 2: Theme toggle**

In your device settings, switch between light and dark. Open the app each time — both themes should render every screen with no white-on-white or black-on-black leaks. Borders and shadows visible.

- [ ] **Step 3: Language toggle**

Switch device language between English and Bahasa Melayu. Confirm:
- [ ] Greeting flips ("Selamat pagi" / "Good morning").
- [ ] "Fuel prices" / "Harga minyak" swaps.
- [ ] "Week of {date}" / "Minggu {date}" with the date interpolated correctly.
- [ ] Cadence label ("Weekly" / "Mingguan") swaps.

- [ ] **Step 4: Network resilience**

- [ ] Toggle airplane mode, pull-to-refresh on detail screen — error tile appears with the **Retry / Cuba lagi** button.
- [ ] Restore network, tap retry — data reloads successfully.

- [ ] **Step 5: README badge update — optional**

If everything looks right, update the README's "Screenshots" section line from "_Coming soon_" to a brief note that Plan 01 is complete and the app runs end-to-end on the new architecture. Skip if you'd rather wait until there's actually a screenshot to show.

- [ ] **Step 6: Tag the milestone**

```bash
git tag plan-01-foundation-complete
```

This is purely an internal marker so Plan 02 can branch from a known-good state. No push required.

---

## What ships at the end of Plan 01

- App architecture is migrated from `App.tsx` → `expo-router`.
- Theme (light + dark, Editorial-neutral palette) and i18n (BM + EN, auto-detect) work end-to-end with persistence.
- `apiGet` accepts named base URLs ready for BNM / METMalaysia in Plan 02.
- Existing fuel-price functionality is preserved and now lives in:
  - A `useFuelPriceQuery` hook (reusable pattern for the 9 other datasets).
  - A polished detail screen with hero card + high/low/avg stats + history list.
  - A featured tile on the Home screen.
- UI primitives (Card, Chip, SectionHead, StatCard, Skeleton, DataView) are in place for Plan 02 and Plan 03 to consume.
- No regressions: every behaviour the original app had still works.

## What's deferred to Plan 02

- Custom dev client (`expo-dev-client` + EAS) → unlocks Skia and Victory Native.
- Charts (`MiniSparkline`, `LineChart`).
- Onboarding flow (3 cards: intro / language + theme / location).
- Catalogue, Saved, Settings tabs.
- 9 additional dataset hooks (CPI, unemployment, births, vehicle regs, population, weather, AQI, FX, dam levels).
- Daily indicator strip on Home.
- Location picker + `expo-location` integration.

## What's deferred to Plan 03

- Trending list, categories grid, search, dataset registry.
- Saved screen empty/populated states.
- Settings screen full content (theme/language/location/about rows).
- Featured tile rotation logic.
- Polish: haptics, refined skeletons per screen, error-state illustrations, accessibility pass.
- Test scaffolding (`jest`, `@testing-library/react-native`).
