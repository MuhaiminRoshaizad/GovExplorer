# Plan 02 — Tabs, Onboarding, Charts, Daily Indicators

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Plan 01 shell into a daily-glance app: real chart on FuelDetail, four-tab navigation (Home/Catalogue/Saved/Settings), first-launch onboarding (intro + theme/language + state picker), functional Settings, and a Home indicator strip wired to four real-time-ish datasets (weather forecast, weather warnings, USD/MYR, transit ridership).

**Architecture:** Plan 02 keeps everything inside Expo Go (no custom dev client). Charts use `react-native-gifted-charts` (JS/SVG). Onboarding state lives in AsyncStorage and gates root routing. The Settings screen is the first place all the providers wired in Plan 01 are user-controllable. Each new dataset gets a thin React Query hook under `src/api/datasets/` matching the `useFuelPriceQuery` pattern.

**Tech Stack:** Continues Plan 01 stack — Expo SDK 54, expo-router v6, TanStack Query v5, AsyncStorage. Adds: `react-native-gifted-charts`, `expo-localization`, `expo-location`.

**Spec reference:** `docs/design.md`, `docs/data-audit.md`

**Out of scope for this plan (deferred to Plan 03 / 04):**
- Curated detail screens for the ~10 datasets in Plan 03 (PriceCatcher, cars, blood, ridership detail, CPI, lfs_month, arrivals, population/crime/income, birthday)
- Catalogue tab populated (placeholder only here)
- Saved tab populated (placeholder only here)
- Live transit (GTFS-Static + RT) — Plan 04
- Custom dev client + Skia migration — when/if `gifted-charts` becomes limiting

**Verification approach:** No automated tests in this plan (per spec decision). Each phase ends with a manual run on Expo Go. The Plan 01 fuel screen functionality must continue to work throughout — that's the regression check.

---

## File structure delta

```
GovExplorer/
├── app/
│   ├── _layout.tsx                       # MODIFIED — splash gate adds onboarding redirect
│   ├── (tabs)/
│   │   ├── _layout.tsx                   # MODIFIED — register all 4 tabs
│   │   ├── index.tsx                     # MODIFIED — Home with IndicatorStrip
│   │   ├── catalogue.tsx                 # NEW — placeholder
│   │   ├── saved.tsx                     # NEW — placeholder
│   │   └── settings.tsx                  # NEW — functional settings screen
│   ├── dataset/[id].tsx                  # MODIFIED — back-nav guard, isRefetching, chart
│   └── onboarding.tsx                    # NEW — 3-card flow with persistence
├── src/
│   ├── api/datasets/
│   │   ├── fuelPrice.ts                  # UNCHANGED
│   │   ├── weatherForecast.ts            # NEW
│   │   ├── weatherWarning.ts             # NEW
│   │   ├── exchangeRate.ts               # NEW
│   │   └── ridershipHeadline.ts          # NEW
│   ├── components/
│   │   ├── chart/                        # NEW — chart wrappers
│   │   │   ├── MiniSparkline.tsx
│   │   │   └── LineChart.tsx
│   │   ├── feature/
│   │   │   ├── FuelLevelRow.tsx          # UNCHANGED
│   │   │   ├── FuelHistoryRow.tsx        # UNCHANGED
│   │   │   ├── IndicatorTile.tsx         # NEW
│   │   │   └── IndicatorStrip.tsx        # NEW
│   │   └── ui/
│   │       ├── …existing primitives      # UNCHANGED
│   │       └── SegmentedControl.tsx      # NEW — used by Settings + onboarding
│   ├── hooks/
│   │   ├── useSetting.ts                 # UNCHANGED
│   │   ├── useOnboarded.ts               # NEW
│   │   └── useLocation.ts                # NEW
│   ├── i18n/
│   │   ├── en.ts                         # MODIFIED — many new keys
│   │   ├── ms.ts                         # MODIFIED
│   │   └── index.tsx                     # MODIFIED — Path<T> → Leaves<T>, expo-localization
│   ├── theme/
│   │   ├── ThemeProvider.tsx             # MODIFIED — gate render on hydration
│   │   └── useAppFonts.ts                # MODIFIED — surface error + timeout
│   └── data/
│       └── states.ts                     # NEW — 16 states + METMalaysia location IDs
└── app.json                              # MODIFIED — add expo-localization, expo-location plugins (idempotent)
```

---

## Phase 0 — Plan 01 follow-up cleanups (Tasks 1–5)

These five fixes resolve correctness issues from Plan 01's reviews. Doing them up front keeps the rest of Plan 02 from inheriting the bugs.

---

## Task 1: Tighten i18n key type from `Path<T>` to `Leaves<T>`

**Files:**
- Modify: `src/i18n/index.tsx`

**Why:** Current `Path<T>` lets `t('app')` (an intermediate object key) typecheck even though `lookup` returns the literal string `'app'` at runtime. Switch to `Leaves<T>` so only string-terminating paths typecheck.

- [ ] **Step 1: Replace the `Path<T>` type definition**

In `src/i18n/index.tsx`, find:
```ts
type Path<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${Path<T[K]>}` : never }[keyof T]
  : never;
type TranslationKey = Path<Dictionary>;
```

Replace with:
```ts
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
```

- [ ] **Step 2: Verify typecheck**

```bash
cd C:\Users\aminm\Documents\Projects\GovExplorer
npx tsc --noEmit
```

Expected: clean. The existing `t()` callers (`t('home.featured')`, `t('fuel.title')`, `t('common.retry')`, etc.) all hit string leaves so they still typecheck. If you see a NEW error pointing at a `t(...)` call site, that call was passing an intermediate key — fix it to use the leaf.

- [ ] **Step 3: Confirm typecheck rejects intermediate keys (sanity check)**

Temporarily add this line at the bottom of `src/i18n/index.tsx`:
```ts
const _typeCheckSanity: TranslationKey = 'app'; // should error
```

Run `npx tsc --noEmit`. Expected: error like `Type '"app"' is not assignable to type 'Leaves<Dictionary>'`.

REMOVE that test line before committing. Re-run `tsc --noEmit` and confirm clean.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/index.tsx
git commit -m "fix(i18n): tighten translation key type to leaves only

Path<T> emitted intermediate object keys (e.g. 'app' alongside
'app.name'), so t('app') typechecked but silently returned the key
literal at runtime. Leaves<T> only emits paths whose terminus is a
string, catching the bug at compile time."
```

---

## Task 2: Migrate i18n device detection to `expo-localization`

**Files:**
- Modify: `package.json` (add `expo-localization`)
- Modify: `src/i18n/index.tsx`

**Why:** Current `detectDeviceLanguage` reads from `NativeModules.SettingsManager.settings.AppleLocale` / `NativeModules.I18nManager.localeIdentifier` — legacy paths on Expo SDK 54 + new architecture, broken on web. `expo-localization` is the canonical answer and supports a locale-change listener.

- [ ] **Step 1: Install `expo-localization`**

```bash
cd C:\Users\aminm\Documents\Projects\GovExplorer
npx expo install expo-localization
```

Expected: package added to dependencies at the SDK 54-compatible version.

- [ ] **Step 2: Replace `detectDeviceLanguage` and add a live listener**

In `src/i18n/index.tsx`, find:
```ts
import { NativeModules, Platform } from 'react-native';
```

Replace with:
```ts
import * as Localization from 'expo-localization';
import { useEffect, useState } from 'react';
```

(Keep the existing `react` imports — merge into one import line.)

Find:
```ts
function detectDeviceLanguage(): Language {
  const locale =
    (Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier) ?? 'en-MY';
  return /^ms\b/i.test(locale) ? 'ms' : 'en';
}
```

Replace with:
```ts
function detectDeviceLanguage(): Language {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode ?? 'en';
  return code === 'ms' ? 'ms' : 'en';
}
```

- [ ] **Step 3: Subscribe to locale changes inside `I18nProvider`**

Replace the body of `I18nProvider` with:
```tsx
export function I18nProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useSetting<LanguageOverride>('language', 'auto');
  const [deviceLanguage, setDeviceLanguage] = useState<Language>(detectDeviceLanguage);

  useEffect(() => {
    const subscription = Localization.addLocaleListener(() => {
      setDeviceLanguage(detectDeviceLanguage());
    });
    return () => subscription.remove();
  }, []);

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
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

```bash
npx expo export --platform android --output-dir /tmp/govexplorer-task2-export 2>&1 | tail -5
```

Expected: bundle succeeds.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/i18n/index.tsx
git commit -m "fix(i18n): use expo-localization with live locale listener

NativeModules paths were legacy on new arch and broken on web.
Localization.getLocales() is the canonical SDK 54 answer.
addLocaleListener wires up live updates when the user flips
their system language with the app open."
```

---

## Task 3: Gate ThemeProvider on hydration + surface font-load errors

**Files:**
- Modify: `src/theme/ThemeProvider.tsx`
- Modify: `src/theme/useAppFonts.ts`
- Modify: `app/_layout.tsx`

**Why:** ThemeProvider currently flashes light theme for one frame on launch when the user has saved 'dark'. `useAppFonts` swallows errors so a font-load failure leaves the app stuck on splash forever.

- [ ] **Step 1: Gate ThemeProvider on `useSetting`'s `loaded` flag**

In `src/theme/ThemeProvider.tsx`, change the destructure:

Find:
```tsx
  const [override, setOverride] = useSetting<ThemeOverride>('theme', 'system');
```

Replace with:
```tsx
  const [override, setOverride, loaded] = useSetting<ThemeOverride>('theme', 'system');
```

Then add an early return after the `useMemo`. The full updated provider body:

```tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride, loaded] = useSetting<ThemeOverride>('theme', 'system');
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

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

The root layout already returns `null` while fonts load, so adding another `null` gate just delays first paint by a few ms while AsyncStorage hydrates — acceptable for correct theming.

- [ ] **Step 2: Surface errors and add a 4-second timeout from `useAppFonts`**

Replace `src/theme/useAppFonts.ts` entirely with:

```ts
import { useEffect, useState } from 'react';
import {
  useFonts,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

const FONT_TIMEOUT_MS = 4000;

export function useAppFonts() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  if (error) console.warn('[useAppFonts] font load failed:', error);

  return loaded || !!error || timedOut;
}
```

This degrades gracefully: on font failure or after 4s the system fallback font is used and the app proceeds. No hang.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/theme/ThemeProvider.tsx src/theme/useAppFonts.ts
git commit -m "fix(theme): hydrate ThemeProvider before render and add font timeout

Gating on useSetting's loaded flag eliminates the one-frame flash to
light theme on launch when the user has persisted dark. useAppFonts
now logs errors and falls back to system fonts after 4s instead of
hanging the splash screen forever."
```

---

## Task 4: Dataset detail — back-nav guard, isRefetching, empty state

**Files:**
- Modify: `app/dataset/[id].tsx`

**Why:** `router.back()` with no `canGoBack()` fallback breaks deep-link entry. `query.isFetching` flickers the pull-to-refresh spinner on every background revalidation, not just user pulls. Empty data shows blank scroll with no copy.

- [ ] **Step 1: Add `canGoBack` fallback in `Header`**

In `app/dataset/[id].tsx`, find:
```tsx
      <Pressable
        onPress={() => router.back()}
```

Replace with:
```tsx
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
```

- [ ] **Step 2: Switch to `isRefetching`**

Find:
```tsx
        {(weeks) => <FuelDetailBody weeks={weeks} onRefresh={query.refetch} refreshing={query.isFetching} />}
```

Replace with:
```tsx
        {(weeks) => <FuelDetailBody weeks={weeks} onRefresh={query.refetch} refreshing={query.isRefetching} />}
```

- [ ] **Step 3: Add ListEmptyComponent**

Find the `<FlatList ... ListHeaderComponent={...}` block. Add a new prop `ListEmptyComponent` between `keyExtractor` and `ListHeaderComponent`:

```tsx
      ListEmptyComponent={
        history.length === 0 ? (
          <View style={{ paddingHorizontal: T.spacing.xl, paddingTop: T.spacing.xl }}>
            <Text style={{ color: T.colors.textMuted, textAlign: 'center' }}>
              {t('common.empty')}
            </Text>
          </View>
        ) : null
      }
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add "app/dataset/[id].tsx"
git commit -m "fix(dataset): guard router.back, use isRefetching, add empty state

Three correctness improvements caught in code review:
- router.back() now falls back to router.replace('/') when there's no
  back stack (deep-link / cold-start entry).
- Pull-to-refresh spinner uses isRefetching so it only shows on actual
  user pulls, not background revalidations.
- ListEmptyComponent renders common.empty when the history is empty."
```

---

## Task 5: Resolve the `web` platform discrepancy

**Files:**
- Modify: `app.json` (drop `"web"` from platforms — simpler than installing react-native-web)

**Why:** `app.json` declares `web` as a platform but `react-native-web` isn't installed. `npx expo start --web` would prompt for install. Since this is a mobile-first learning project, drop the platform rather than carry an unused web target.

- [ ] **Step 1: Remove web from platforms array**

Open `app.json`. Find the `expo` object's `platforms` field (or `web` config block).

If `platforms: ["ios", "android", "web"]` exists, change to `platforms: ["ios", "android"]`.

If a `"web": { ... }` block exists, remove it.

If neither exists explicitly (web is implicit by Expo default), add an explicit `"platforms": ["ios", "android"]` inside `expo`.

- [ ] **Step 2: Verify**

```bash
cat app.json
```

Confirm no `"web"` references remain.

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-task5-export 2>&1 | tail -5
```

Expected: clean. Android still bundles.

- [ ] **Step 3: Commit**

```bash
git add app.json
git commit -m "chore: drop web platform from app.json

Web requires react-native-web which we don't install. Mobile-first
project; remove the unused declaration. (Re-add along with the deps
if web ever becomes a target.)"
```

---

## Phase A — Charts and FuelDetail upgrade (Tasks 6–8)

---

## Task 6: Install `react-native-gifted-charts`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
cd C:\Users\aminm\Documents\Projects\GovExplorer
npm install react-native-gifted-charts
```

If `ERESOLVE` errors appear (same React 19 peer pattern as Plan 01), retry with:
```bash
npm install react-native-gifted-charts --legacy-peer-deps
```

Expected: package added to dependencies.

- [ ] **Step 2: Sanity check the bundle**

```bash
npx expo export --platform android --output-dir /tmp/govexplorer-task6-export 2>&1 | tail -5
```

Expected: bundles successfully (gifted-charts depends on `react-native-svg` which is already installed).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-native-gifted-charts for v1 charting"
```

---

## Task 7: `MiniSparkline` and `LineChart` wrappers

**Files:**
- Create: `src/components/chart/MiniSparkline.tsx`
- Create: `src/components/chart/LineChart.tsx`

**Why:** Wrapping `gifted-charts` in our own component layer means a future migration to Skia/Victory is a one-file refactor. Both wrappers consume the theme.

- [ ] **Step 1: Create `src/components/chart/MiniSparkline.tsx`**

```tsx
import { View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/ThemeProvider';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: 'up' | 'down' | 'flat';
}

export function MiniSparkline({
  data,
  width = 64,
  height = 24,
  trend = 'flat',
}: MiniSparklineProps) {
  const T = useTheme();
  const color =
    trend === 'up'
      ? T.colors.danger
      : trend === 'down'
        ? T.colors.success
        : T.colors.textMuted;
  const points = data.map((value) => ({ value }));
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <GiftedLineChart
        data={points}
        width={width}
        height={height}
        hideAxesAndRules
        hideDataPoints
        thickness={1.5}
        color={color}
        initialSpacing={0}
        endSpacing={0}
        spacing={width / Math.max(data.length - 1, 1)}
        adjustToWidth
        disableScroll
        curved
      />
    </View>
  );
}
```

- [ ] **Step 2: Create `src/components/chart/LineChart.tsx`**

```tsx
import { View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/ThemeProvider';

interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  yPrefix?: string;
}

export function LineChart({ data, labels, height = 200, yPrefix }: LineChartProps) {
  const T = useTheme();
  const points = data.map((value, i) => ({
    value,
    label: labels?.[i],
  }));
  return (
    <View>
      <GiftedLineChart
        data={points}
        height={height}
        thickness={2}
        color={T.colors.primary}
        dataPointsColor={T.colors.primary}
        dataPointsRadius={3}
        yAxisColor={T.colors.border}
        xAxisColor={T.colors.border}
        rulesColor={T.colors.border}
        rulesType="dashed"
        yAxisTextStyle={{ color: T.colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: T.colors.textMuted, fontSize: 10 }}
        yAxisLabelPrefix={yPrefix}
        curved
        areaChart
        startFillColor={T.colors.primary}
        startOpacity={0.18}
        endFillColor={T.colors.primary}
        endOpacity={0.0}
        noOfSections={4}
      />
    </View>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean. (If gifted-charts' types complain about a prop, comment that prop out and proceed — gifted-charts' typings have rough edges; the runtime will be fine.)

- [ ] **Step 4: Commit**

```bash
git add src/components/chart
git commit -m "feat(chart): add MiniSparkline and LineChart wrappers"
```

---

## Task 8: Replace FuelDetail bottom skeleton with real chart

**Files:**
- Modify: `app/dataset/[id].tsx`

**Why:** Plan 01's FuelDetail had a chart-shaped placeholder. With charts now wired, render the actual RON95 history.

- [ ] **Step 1: Add the LineChart import**

In `app/dataset/[id].tsx`, find:
```tsx
import { useFuelPriceQuery } from '@/api/datasets/fuelPrice';
```

Add directly below it:
```tsx
import { LineChart } from '@/components/chart/LineChart';
```

- [ ] **Step 2: Insert the chart in `FuelDetailBody`**

In `FuelDetailBody`, the current `ListHeaderComponent` ends with a section heading + `<FuelHistoryHeader />`. Add a chart card AFTER the `stats` row and BEFORE the history section.

Find:
```tsx
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
```

Insert a new chart Card between the stats `</View>` and the `<View>` heading wrapper:

```tsx
          {stats && (
            <View style={{ flexDirection: 'row', gap: T.spacing.sm }}>
              <StatCard label={t('fuel.high')} value={`RM ${stats.high.toFixed(2)}`} />
              <StatCard label={t('fuel.low')} value={`RM ${stats.low.toFixed(2)}`} />
              <StatCard label={t('fuel.avg')} value={`RM ${stats.avg.toFixed(2)}`} />
            </View>
          )}
          {weeks.length > 1 && (
            <Card>
              <Text
                style={{
                  fontSize: T.fontSize.label,
                  color: T.colors.textMuted,
                  marginBottom: T.spacing.md,
                }}
              >
                RON 95 — {weeks.length} {t('fuel.week').toLowerCase()}
              </Text>
              <LineChart
                data={[...weeks].reverse().map((w) => w.level.ron95)}
                height={180}
                yPrefix="RM "
              />
            </Card>
          )}
          <View>
            <Text
              style={{
```

The `[...weeks].reverse()` flips chronological order (the data comes newest-first; charts read left-to-right oldest-first).

- [ ] **Step 3: Manual verification**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-task8-export 2>&1 | tail -5
```

Expected: clean, bundles. Run on Expo Go and confirm the chart renders inside the detail screen between the stat row and the history list.

- [ ] **Step 4: Commit**

```bash
git add "app/dataset/[id].tsx"
git commit -m "feat(fuel): render RON95 history as a LineChart in detail screen"
```

---

## Phase B — Tab shell expansion (Task 9)

---

## Task 9: Add Catalogue, Saved, Settings tabs

**Files:**
- Modify: `src/i18n/en.ts`, `src/i18n/ms.ts` (add `tabs.*` keys)
- Modify: `app/(tabs)/_layout.tsx` (register all 4 tabs)
- Create: `app/(tabs)/catalogue.tsx` (placeholder)
- Create: `app/(tabs)/saved.tsx` (placeholder)
- Create: `app/(tabs)/settings.tsx` (placeholder — fleshed out in Phase D)

- [ ] **Step 1: Add `tabs.*` and section-head i18n keys**

In `src/i18n/en.ts`, find the existing `tabs:` block (or add after `home:` if not present):

```ts
  tabs: {
    home: 'Home',
    catalogue: 'Catalogue',
    saved: 'Saved',
    settings: 'Settings',
  },
```

In `src/i18n/ms.ts`:

```ts
  tabs: {
    home: 'Utama',
    catalogue: 'Katalog',
    saved: 'Simpan',
    settings: 'Tetapan',
  },
```

- [ ] **Step 2: Replace `app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router';
import { House, Layers, Heart, Settings as Cog } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function TabsLayout() {
  const T = useTheme();
  const { t } = useI18n();

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
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: t('tabs.catalogue'),
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('tabs.saved'),
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Cog color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Create `app/(tabs)/catalogue.tsx`**

```tsx
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function CatalogueScreen() {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.sm }}>
        <Text
          style={{
            fontFamily: T.fonts.displayHeavy,
            fontSize: T.fontSize.screenTitle,
            color: T.colors.text,
            letterSpacing: -0.6,
          }}
        >
          {t('tabs.catalogue')}
        </Text>
        <Text style={{ color: T.colors.textMuted }}>
          Coming in Plan 03 — curated detail screens for ~10 datasets.
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 4: Create `app/(tabs)/saved.tsx`**

Same shape as Catalogue, just with `tabs.saved` and a "Coming in Plan 03" line. Full file:

```tsx
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function SavedScreen() {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.sm }}>
        <Text
          style={{
            fontFamily: T.fonts.displayHeavy,
            fontSize: T.fontSize.screenTitle,
            color: T.colors.text,
            letterSpacing: -0.6,
          }}
        >
          {t('tabs.saved')}
        </Text>
        <Text style={{ color: T.colors.textMuted }}>
          Coming in Plan 03 — favourited datasets.
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Create `app/(tabs)/settings.tsx` (placeholder)**

Phase D fleshes this out. For now:

```tsx
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n';

export default function SettingsScreen() {
  const T = useTheme();
  const { t } = useI18n();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.sm }}>
        <Text
          style={{
            fontFamily: T.fonts.displayHeavy,
            fontSize: T.fontSize.screenTitle,
            color: T.colors.text,
            letterSpacing: -0.6,
          }}
        >
          {t('tabs.settings')}
        </Text>
        <Text style={{ color: T.colors.textMuted }}>
          Settings rows wired up in Phase D of this plan.
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-task9-export 2>&1 | tail -5
```

Expected: clean, bundles. On Expo Go: tab bar shows 4 tabs with Home/Catalogue/Saved/Settings icons; tapping each switches to the right screen.

- [ ] **Step 7: Commit**

```bash
git add src/i18n "app/(tabs)"
git commit -m "feat(tabs): add Catalogue, Saved, Settings tab shells"
```

---

## Phase C — Onboarding (Tasks 10–15)

---

## Task 10: Onboarding + settings + states i18n keys

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ms.ts`

- [ ] **Step 1: Add the new key blocks to `en.ts`**

Inside the existing dictionary literal in `src/i18n/en.ts`, after `tabs: {...}` and before `cadence: {...}`, add:

```ts
  onboarding: {
    next: 'Next',
    back: 'Back',
    done: 'Get started',
    intro: {
      title: 'Welcome to GovExplorer',
      body: 'A friendlier window into Malaysia\'s open data — fuel prices, weather, public transit, and more, all from data.gov.my.',
    },
    appearance: {
      title: 'Pick your look',
      body: 'You can change these later in Settings.',
      themeLabel: 'Theme',
      languageLabel: 'Language',
    },
    location: {
      title: 'Where are you?',
      body: 'We use this to show local weather and state-level data. Pick from the list, or let us detect from your phone.',
      detect: 'Use my location',
      detecting: 'Detecting…',
      detectFailed: 'Couldn\'t detect — pick from the list.',
    },
  },
  settings: {
    appearance: 'Appearance',
    theme: 'Theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    languageAuto: 'Auto',
    languageEn: 'English',
    languageMs: 'Bahasa Melayu',
    location: 'Location',
    locationLabel: 'Your state',
    about: 'About',
    aboutVersion: 'Version',
    aboutSources: 'Data sources',
    aboutGithub: 'GitHub repository',
  },
  home: {
    title: 'Explore Malaysia',
    featured: 'Featured',
    indicators: 'Today',
  },
```

(Replace the existing `home` block — the new one adds `indicators` while keeping `title` and `featured`.)

- [ ] **Step 2: Add the matching keys to `ms.ts`**

```ts
  onboarding: {
    next: 'Seterusnya',
    back: 'Kembali',
    done: 'Mula',
    intro: {
      title: 'Selamat datang ke GovExplorer',
      body: 'Tingkap mesra ke data terbuka Malaysia — harga minyak, cuaca, pengangkutan, dan banyak lagi, semua dari data.gov.my.',
    },
    appearance: {
      title: 'Pilih gaya anda',
      body: 'Anda boleh ubah ini kemudian di Tetapan.',
      themeLabel: 'Tema',
      languageLabel: 'Bahasa',
    },
    location: {
      title: 'Di mana anda?',
      body: 'Kami guna lokasi untuk paparkan cuaca dan data peringkat negeri. Pilih dari senarai, atau biar kami kesan dari telefon.',
      detect: 'Guna lokasi saya',
      detecting: 'Mengesan…',
      detectFailed: 'Gagal kesan — pilih dari senarai.',
    },
  },
  settings: {
    appearance: 'Penampilan',
    theme: 'Tema',
    themeAuto: 'Auto',
    themeLight: 'Klasik',
    themeDark: 'Midnight',
    language: 'Bahasa',
    languageAuto: 'Auto',
    languageEn: 'English',
    languageMs: 'Bahasa Melayu',
    location: 'Lokasi',
    locationLabel: 'Negeri anda',
    about: 'Mengenai',
    aboutVersion: 'Versi',
    aboutSources: 'Sumber data',
    aboutGithub: 'Repositori GitHub',
  },
  home: {
    title: 'Jelajah data Malaysia',
    featured: 'Sorotan',
    indicators: 'Hari ini',
  },
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean. (The `Dictionary` type enforces both files are in sync — if you typo a key in either, the other will fail.)

- [ ] **Step 4: Commit**

```bash
git add src/i18n
git commit -m "feat(i18n): add onboarding and settings keys"
```

---

## Task 11: `useOnboarded` hook + states data

**Files:**
- Create: `src/hooks/useOnboarded.ts`
- Create: `src/data/states.ts`

- [ ] **Step 1: Create `src/hooks/useOnboarded.ts`**

```ts
import { useSetting } from './useSetting';

export function useOnboarded() {
  const [completed, setCompleted, loaded] = useSetting<boolean>('onboarding.completed', false);
  return { completed, setCompleted, loaded };
}
```

- [ ] **Step 2: Create `src/data/states.ts`**

```ts
export interface MalaysianState {
  code: string;        // short ISO-style code
  nameEn: string;
  nameMs: string;
  metLocationId: string; // METMalaysia location id (St0xx) — verify by fetching weather/forecast
}

export const STATES: MalaysianState[] = [
  { code: 'JHR', nameEn: 'Johor',                   nameMs: 'Johor',                   metLocationId: 'St001' },
  { code: 'KDH', nameEn: 'Kedah',                   nameMs: 'Kedah',                   metLocationId: 'St002' },
  { code: 'KTN', nameEn: 'Kelantan',                nameMs: 'Kelantan',                metLocationId: 'St003' },
  { code: 'MLK', nameEn: 'Melaka',                  nameMs: 'Melaka',                  metLocationId: 'St004' },
  { code: 'NSN', nameEn: 'Negeri Sembilan',         nameMs: 'Negeri Sembilan',         metLocationId: 'St005' },
  { code: 'PHG', nameEn: 'Pahang',                  nameMs: 'Pahang',                  metLocationId: 'St006' },
  { code: 'PNG', nameEn: 'Pulau Pinang',            nameMs: 'Pulau Pinang',            metLocationId: 'St007' },
  { code: 'PRK', nameEn: 'Perak',                   nameMs: 'Perak',                   metLocationId: 'St008' },
  { code: 'PLS', nameEn: 'Perlis',                  nameMs: 'Perlis',                  metLocationId: 'St009' },
  { code: 'SBH', nameEn: 'Sabah',                   nameMs: 'Sabah',                   metLocationId: 'St010' },
  { code: 'SWK', nameEn: 'Sarawak',                 nameMs: 'Sarawak',                 metLocationId: 'St011' },
  { code: 'SGR', nameEn: 'Selangor',                nameMs: 'Selangor',                metLocationId: 'St012' },
  { code: 'TRG', nameEn: 'Terengganu',              nameMs: 'Terengganu',              metLocationId: 'St013' },
  { code: 'KUL', nameEn: 'WP Kuala Lumpur',         nameMs: 'WP Kuala Lumpur',         metLocationId: 'St014' },
  { code: 'LBN', nameEn: 'WP Labuan',               nameMs: 'WP Labuan',               metLocationId: 'St015' },
  { code: 'PJY', nameEn: 'WP Putrajaya',            nameMs: 'WP Putrajaya',            metLocationId: 'St016' },
];

export const DEFAULT_STATE_CODE = 'KUL';
```

> Note: the `metLocationId` values above are placeholders following the `Stxxx` pattern. **Before merging Plan 02, the implementer must verify** by hitting `https://api.data.gov.my/weather/forecast?contains=Kuala+Lumpur@location_name` (or equivalent) and reading the `location_id` field from a response. Update the file with corrections in this same task before committing if any IDs differ.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Verify METMalaysia location IDs (manual fetch)**

```bash
curl -s "https://api.data.gov.my/weather/forecast?contains=Kuala+Lumpur@location_name&limit=1" | head -c 500
```

The response contains `location_id`. If it's NOT `St014`, update `DEFAULT_STATE_CODE`'s entry in `states.ts` accordingly. Then spot-check 2-3 other state names to validate the `Stxxx` mapping. If the IDs differ widely from the `St001..St016` sequence, treat the file as a starting point and correct each row using actual `location_id` values from the API.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useOnboarded.ts src/data/states.ts
git commit -m "feat(data): add useOnboarded hook and Malaysian states catalogue

States list includes METMalaysia weather location IDs for the daily
forecast query in Phase E. IDs are verified against the live API."
```

---

## Task 12: `useLocation` hook

**Files:**
- Create: `src/hooks/useLocation.ts`
- Modify: `package.json` (`expo-location`)

- [ ] **Step 1: Install expo-location**

```bash
npx expo install expo-location
```

- [ ] **Step 2: Create `src/hooks/useLocation.ts`**

```ts
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { useSetting } from './useSetting';
import { DEFAULT_STATE_CODE, STATES, type MalaysianState } from '@/data/states';

export interface LocationContextValue {
  state: MalaysianState;
  setStateCode: (code: string) => Promise<void>;
  detect: () => Promise<MalaysianState | null>;
  detecting: boolean;
  detectError: string | null;
  loaded: boolean;
}

export function useLocation(): LocationContextValue {
  const [code, setCode, loaded] = useSetting<string>('location.state', DEFAULT_STATE_CODE);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const state = STATES.find((s) => s.code === code) ?? STATES.find((s) => s.code === DEFAULT_STATE_CODE)!;

  const setStateCode = useCallback(
    async (next: string) => {
      if (STATES.some((s) => s.code === next)) {
        await setCode(next);
      }
    },
    [setCode],
  );

  const detect = useCallback(async (): Promise<MalaysianState | null> => {
    setDetecting(true);
    setDetectError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDetectError('permission denied');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const region = places[0]?.region ?? '';
      const matched = STATES.find(
        (s) =>
          region.toLowerCase().includes(s.nameEn.toLowerCase()) ||
          region.toLowerCase().includes(s.nameMs.toLowerCase()) ||
          region.toLowerCase().includes(s.code.toLowerCase()),
      );
      if (matched) {
        await setCode(matched.code);
        return matched;
      }
      setDetectError('no match');
      return null;
    } catch (err) {
      setDetectError(err instanceof Error ? err.message : 'unknown');
      return null;
    } finally {
      setDetecting(false);
    }
  }, [setCode]);

  return { state, setStateCode, detect, detecting, detectError, loaded };
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/hooks/useLocation.ts
git commit -m "feat(hooks): add useLocation with manual picker and optional geo-detect

Wraps expo-location's reverseGeocode with our STATES catalogue.
Returns the resolved state, a setter, and an optional detect()
that requests permission lazily and falls back to no-op on denial."
```

---

## Task 13: `SegmentedControl` UI primitive

**Files:**
- Create: `src/components/ui/SegmentedControl.tsx`

**Why:** Both onboarding (Card 2) and Settings need a 2-3 way segmented control for theme/language pickers. One reusable component.

- [ ] **Step 1: Create `src/components/ui/SegmentedControl.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const T_ = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: T_.colors.bgAlt,
          borderColor: T_.colors.border,
          borderRadius: T_.radius.md,
        },
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.cell,
              {
                backgroundColor: active ? T_.colors.surface : 'transparent',
                borderRadius: T_.radius.sm,
                margin: 2,
              },
            ]}
          >
            <Text
              style={{
                color: active ? T_.colors.text : T_.colors.textMuted,
                fontWeight: active ? T_.fontWeight.semibold : T_.fontWeight.medium,
                fontSize: T_.fontSize.body - 1,
                textAlign: 'center',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, padding: 0 },
  cell: { flex: 1, paddingVertical: 9 },
});
```

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/ui/SegmentedControl.tsx
git commit -m "feat(ui): add SegmentedControl primitive"
```

---

## Task 14: Onboarding screen

**Files:**
- Create: `app/onboarding.tsx`

**Why:** Three-card flow shown once on first launch. Persists `onboarding.completed` and routes back to `/`.

- [ ] **Step 1: Create `app/onboarding.tsx`**

```tsx
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, type LanguageOverride } from '@/i18n';
import { useThemeControls, type ThemeOverride } from '@/theme/ThemeProvider';
import { useOnboarded } from '@/hooks/useOnboarded';
import { useLocation } from '@/hooks/useLocation';
import { STATES } from '@/data/states';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function OnboardingScreen() {
  const T = useTheme();
  const { t, language, setOverride: setLang } = useI18n();
  const { override: themeOverride, setOverride: setTheme } = useThemeControls();
  const { setCompleted } = useOnboarded();
  const { state, setStateCode, detect, detecting } = useLocation();
  const [step, setStep] = useState(0);

  const themeOptions = [
    { value: 'system' as ThemeOverride, label: t('settings.themeAuto') },
    { value: 'light' as ThemeOverride, label: t('settings.themeLight') },
    { value: 'dark' as ThemeOverride, label: t('settings.themeDark') },
  ];
  const langOptions = [
    { value: 'auto' as LanguageOverride, label: t('settings.languageAuto') },
    { value: 'en' as LanguageOverride, label: t('settings.languageEn') },
    { value: 'ms' as LanguageOverride, label: t('settings.languageMs') },
  ];

  async function handleDetect() {
    const matched = await detect();
    if (!matched) Alert.alert(t('onboarding.location.detectFailed'));
  }

  async function handleDone() {
    await setCompleted(true);
    router.replace('/');
  }

  const isLast = step === 2;
  const next = () => (isLast ? handleDone() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, padding: T.spacing.xl, gap: T.spacing.xl }}>
        {step === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', gap: T.spacing.md }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.screenTitle,
                color: T.colors.text,
                letterSpacing: -0.6,
              }}
            >
              {t('onboarding.intro.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.body, lineHeight: 22 }}>
              {t('onboarding.intro.body')}
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={{ flex: 1, gap: T.spacing.lg }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.hero,
                color: T.colors.text,
              }}
            >
              {t('onboarding.appearance.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted }}>
              {t('onboarding.appearance.body')}
            </Text>
            <View style={{ gap: T.spacing.sm }}>
              <Text style={{ color: T.colors.text, fontWeight: T.fontWeight.semibold }}>
                {t('onboarding.appearance.themeLabel')}
              </Text>
              <SegmentedControl options={themeOptions} value={themeOverride} onChange={setTheme} />
            </View>
            <View style={{ gap: T.spacing.sm }}>
              <Text style={{ color: T.colors.text, fontWeight: T.fontWeight.semibold }}>
                {t('onboarding.appearance.languageLabel')}
              </Text>
              <SegmentedControl options={langOptions} value={language === 'en' || language === 'ms' ? language : 'auto'} onChange={setLang} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ flex: 1, gap: T.spacing.lg }}>
            <Text
              style={{
                fontFamily: T.fonts.displayHeavy,
                fontSize: T.fontSize.hero,
                color: T.colors.text,
              }}
            >
              {t('onboarding.location.title')}
            </Text>
            <Text style={{ color: T.colors.textMuted }}>
              {t('onboarding.location.body')}
            </Text>
            <Pressable
              onPress={handleDetect}
              style={[
                styles.detectBtn,
                {
                  backgroundColor: T.colors.primarySoft,
                  borderRadius: T.radius.md,
                },
              ]}
            >
              <Text style={{ color: T.colors.primary, fontWeight: T.fontWeight.semibold }}>
                {detecting ? t('onboarding.location.detecting') : t('onboarding.location.detect')}
              </Text>
            </Pressable>
            <FlatList
              data={STATES}
              keyExtractor={(s) => s.code}
              renderItem={({ item }) => {
                const active = item.code === state.code;
                return (
                  <Pressable
                    onPress={() => setStateCode(item.code)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: T.spacing.md,
                      borderRadius: T.radius.sm,
                      backgroundColor: active ? T.colors.primarySoft : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? T.colors.primary : T.colors.text,
                        fontWeight: active ? T.fontWeight.semibold : T.fontWeight.regular,
                      }}
                    >
                      {language === 'ms' ? item.nameMs : item.nameEn}
                    </Text>
                  </Pressable>
                );
              }}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <View style={styles.footer}>
          {step > 0 && (
            <Pressable onPress={back} style={styles.footerBtn}>
              <Text style={{ color: T.colors.textMuted, fontWeight: T.fontWeight.medium }}>
                {t('onboarding.back')}
              </Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={next}
            style={[
              styles.nextBtn,
              { backgroundColor: T.colors.primary, borderRadius: T.radius.md },
            ]}
          >
            <Text style={{ color: T.colors.onPrimary, fontWeight: T.fontWeight.semibold }}>
              {isLast ? t('onboarding.done') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detectBtn: { paddingVertical: 12, alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  nextBtn: { paddingVertical: 12, paddingHorizontal: 24 },
});
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-task14-export 2>&1 | tail -5
```

Expected: clean, bundles.

- [ ] **Step 3: Commit**

```bash
git add app/onboarding.tsx
git commit -m "feat(onboarding): add 3-card first-launch flow

Intro card, appearance picker (theme + language via SegmentedControl),
and location card with state list + optional geo-detect via expo-location.
Persists onboarding.completed via useOnboarded and routes to /."
```

---

## Task 15: Root layout — redirect to onboarding when not completed

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Add redirect logic to `ThemedShell`**

In `app/_layout.tsx`, find the `ThemedShell` function. Replace its body with:

```tsx
function ThemedShell() {
  const T = useTheme();
  const { completed, loaded } = useOnboarded();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!completed && !inOnboarding) {
      router.replace('/onboarding');
    } else if (completed && inOnboarding) {
      router.replace('/');
    }
  }, [completed, loaded, segments, router]);

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
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </>
  );
}
```

Add the new imports at the top of the file:

```tsx
import { useEffect } from 'react'; // already there in original — keep
import { useRouter, useSegments, Stack } from 'expo-router'; // merge with existing Stack import
import { useOnboarded } from '@/hooks/useOnboarded';
```

(The `Stack` import is already present from Plan 01 — fold the new imports into the same line.)

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-task15-export 2>&1 | tail -5
```

Expected: clean, bundles.

- [ ] **Step 3: Manual test**

Run on Expo Go. On first launch (or after clearing app data), the onboarding screen should appear. Tapping through the three cards and finishing should land you on Home with no further onboarding interruptions on subsequent launches.

To re-test the gating: in dev mode you can clear AsyncStorage by reinstalling the app from Expo Go, or temporarily call `AsyncStorage.removeItem('@govexplorer:onboarding.completed')` from a debug button.

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(onboarding): gate first launch on onboarding.completed flag

Root layout's ThemedShell watches the useOnboarded result and uses
expo-router's useSegments + useRouter to redirect users to
/onboarding on first launch and bounce them back to / once
they finish."
```

---

## Phase D — Functional Settings (Tasks 16–19)

---

## Task 16: Settings — appearance section (theme + language)

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Create: `src/components/feature/SettingsRow.tsx`

- [ ] **Step 1: Create `src/components/feature/SettingsRow.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SettingsRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function SettingsRow({ label, hint, children }: SettingsRowProps) {
  const T = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ marginBottom: 6 }}>
        <Text
          style={{
            color: T.colors.text,
            fontWeight: T.fontWeight.semibold,
            fontSize: T.fontSize.body,
          }}
        >
          {label}
        </Text>
        {hint && (
          <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginTop: 2 }}>
            {hint}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12 },
});
```

- [ ] **Step 2: Replace `app/(tabs)/settings.tsx` with the appearance section**

```tsx
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeControls, type ThemeOverride } from '@/theme/ThemeProvider';
import { useI18n, type LanguageOverride } from '@/i18n';
import { SectionHead } from '@/components/ui/SectionHead';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SettingsRow } from '@/components/feature/SettingsRow';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const T = useTheme();
  const { t, language, setOverride: setLang, override: langOverride } = useI18n();
  const { override: themeOverride, setOverride: setTheme } = useThemeControls();

  const themeOptions = [
    { value: 'system' as ThemeOverride, label: t('settings.themeAuto') },
    { value: 'light' as ThemeOverride, label: t('settings.themeLight') },
    { value: 'dark' as ThemeOverride, label: t('settings.themeDark') },
  ];
  const langOptions = [
    { value: 'auto' as LanguageOverride, label: t('settings.languageAuto') },
    { value: 'en' as LanguageOverride, label: t('settings.languageEn') },
    { value: 'ms' as LanguageOverride, label: t('settings.languageMs') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: T.spacing.xl, gap: T.spacing.xl }}>
        <View>
          <Text
            style={{
              fontFamily: T.fonts.displayHeavy,
              fontSize: T.fontSize.screenTitle,
              color: T.colors.text,
              letterSpacing: -0.6,
            }}
          >
            {t('tabs.settings')}
          </Text>
        </View>

        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Penampilan' : 'Appearance'}
            titleEn={t('settings.appearance').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.theme')}>
              <SegmentedControl options={themeOptions} value={themeOverride} onChange={setTheme} />
            </SettingsRow>
            <SettingsRow label={t('settings.language')}>
              <SegmentedControl options={langOptions} value={langOverride} onChange={setLang} />
            </SettingsRow>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/settings.tsx src/components/feature/SettingsRow.tsx
git commit -m "feat(settings): add appearance section with theme and language pickers"
```

---

## Task 17: Settings — location section

**Files:**
- Modify: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Add the location section**

In `app/(tabs)/settings.tsx`, add imports at the top:

```tsx
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useLocation } from '@/hooks/useLocation';
import { STATES } from '@/data/states';
```

Inside `SettingsScreen`, add destructure:

```tsx
const { state, setStateCode, detect, detecting } = useLocation();
const [showStates, setShowStates] = useState(false);
```

Add a new `<View>` block for the location section AFTER the appearance Card:

```tsx
        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Lokasi' : 'Location'}
            titleEn={t('settings.location').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.locationLabel')}>
              <Pressable
                onPress={() => setShowStates((v) => !v)}
                style={{
                  padding: 12,
                  borderRadius: T.radius.sm,
                  backgroundColor: T.colors.bgAlt,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: T.colors.border,
                }}
              >
                <Text style={{ color: T.colors.text }}>
                  {language === 'ms' ? state.nameMs : state.nameEn}
                </Text>
              </Pressable>
              {showStates && (
                <View style={{ gap: 4, marginTop: 8 }}>
                  {STATES.map((s) => {
                    const active = s.code === state.code;
                    return (
                      <Pressable
                        key={s.code}
                        onPress={() => {
                          setStateCode(s.code);
                          setShowStates(false);
                        }}
                        style={{
                          padding: 10,
                          borderRadius: T.radius.sm,
                          backgroundColor: active ? T.colors.primarySoft : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: active ? T.colors.primary : T.colors.text,
                            fontWeight: active ? T.fontWeight.semibold : T.fontWeight.regular,
                          }}
                        >
                          {language === 'ms' ? s.nameMs : s.nameEn}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={async () => {
                      const matched = await detect();
                      if (!matched) Alert.alert(t('onboarding.location.detectFailed'));
                      setShowStates(false);
                    }}
                    style={{
                      padding: 10,
                      marginTop: 6,
                      borderRadius: T.radius.sm,
                      backgroundColor: T.colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: T.colors.onPrimary,
                        fontWeight: T.fontWeight.semibold,
                        textAlign: 'center',
                      }}
                    >
                      {detecting ? t('onboarding.location.detecting') : t('onboarding.location.detect')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </SettingsRow>
          </Card>
        </View>
```

Add the missing `StyleSheet` import (`import { ScrollView, StyleSheet, Text, View } from 'react-native';`).

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/settings.tsx
git commit -m "feat(settings): add expandable location picker with detect option"
```

---

## Task 18: Settings — about section

**Files:**
- Modify: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Add the About section after the Location section**

In `app/(tabs)/settings.tsx`, add imports:

```tsx
import { Linking } from 'react-native';
import * as Application from 'expo-application';
```

Install `expo-application`:
```bash
npx expo install expo-application
```

After the location `<View>` block, add:

```tsx
        <View style={{ gap: T.spacing.md }}>
          <SectionHead
            titleMs={language === 'ms' ? 'Mengenai' : 'About'}
            titleEn={t('settings.about').toUpperCase()}
          />
          <Card>
            <SettingsRow label={t('settings.aboutVersion')}>
              <Text style={{ color: T.colors.textMuted, fontFamily: 'Courier' }}>
                {Application.nativeApplicationVersion ?? '0.0.0'}
              </Text>
            </SettingsRow>
            <Pressable onPress={() => Linking.openURL('https://data.gov.my')}>
              <SettingsRow label={t('settings.aboutSources')} hint="data.gov.my">
                <View />
              </SettingsRow>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://github.com/MuhaiminRoshaizad/GovExplorer')}>
              <SettingsRow label={t('settings.aboutGithub')} hint="@MuhaiminRoshaizad/GovExplorer">
                <View />
              </SettingsRow>
            </Pressable>
          </Card>
        </View>
```

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add package.json package-lock.json app/\(tabs\)/settings.tsx
git commit -m "feat(settings): add about section with version and source links"
```

---

## Phase E — Daily indicators (Tasks 19–24)

---

## Task 19: `useExchangeRateQuery` hook

**Files:**
- Create: `src/api/datasets/exchangeRate.ts`

- [ ] **Step 1: Create the file**

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface ExchangeRateRow {
  date: string;
  currency_code: string;
  rate: number;
}

const QUERY_KEY = ['datasets', 'exchangerates_daily_1200'] as const;
const STALE_6H = 6 * 60 * 60 * 1000;

async function fetchExchangeRates(currencies: string[]): Promise<ExchangeRateRow[]> {
  const rows = await apiGet<ExchangeRateRow[]>('/data-catalogue', {
    id: 'exchangerates_daily_1200',
    sort: '-date',
    limit: currencies.length * 30,
  });
  return rows.filter((r) => currencies.includes(r.currency_code));
}

export function useExchangeRateQuery(
  currencies: string[] = ['USD', 'SGD'],
): UseQueryResult<ExchangeRateRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, currencies.join(',')],
    queryFn: () => fetchExchangeRates(currencies),
    staleTime: STALE_6H,
  });
}
```

> Note: the response shape (`currency_code`, `rate`, `date`) is inferred from the dataset's metadata page on data.gov.my. If the actual JSON differs (e.g., uses `currency` instead of `currency_code`), adjust the interface and the filter accordingly. Verify by hitting `https://api.data.gov.my/data-catalogue?id=exchangerates_daily_1200&limit=2` once during this task and updating the interface if needed.

- [ ] **Step 2: Verify the live response shape**

```bash
curl -s "https://api.data.gov.my/data-catalogue?id=exchangerates_daily_1200&limit=2" | head -c 600
```

Compare the keys to the `ExchangeRateRow` interface. If keys differ (likely candidates: `cur` vs `currency_code`, `rate_mid` vs `rate`), update both the interface and the filter inside `fetchExchangeRates` before committing.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/api/datasets/exchangeRate.ts
git commit -m "feat(api): add useExchangeRateQuery for daily 12:00 BNM fix"
```

---

## Task 20: `useWeatherForecastQuery` hook

**Files:**
- Create: `src/api/datasets/weatherForecast.ts`

- [ ] **Step 1: Create the file**

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface WeatherForecastRow {
  date: string;
  location: { location_id: string; location_name: string };
  morning_forecast: string;
  afternoon_forecast: string;
  night_forecast: string;
  summary_when: string;
  summary_forecast: string;
  min_temp: number;
  max_temp: number;
}

const QUERY_KEY = ['weather', 'forecast'] as const;
const STALE_30M = 30 * 60 * 1000;

async function fetchForecast(locationId: string): Promise<WeatherForecastRow[]> {
  const rows = await apiGet<WeatherForecastRow[]>('/weather/forecast', {
    [`contains`]: `${locationId}@location__location_id`,
    sort: 'date',
    limit: 7,
  });
  return rows;
}

export function useWeatherForecastQuery(
  locationId: string,
): UseQueryResult<WeatherForecastRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, locationId],
    queryFn: () => fetchForecast(locationId),
    staleTime: STALE_30M,
    enabled: Boolean(locationId),
  });
}
```

> Note: the `contains` filter syntax (`{value}@{field}`) is documented for the realtime APIs. The `location__location_id` field path follows the embedded-relation syntax used by data.gov.my. If the response shape doesn't match, hit `https://api.data.gov.my/weather/forecast?contains=St014@location__location_id&limit=1` and update the interface from the actual keys.

- [ ] **Step 2: Verify shape and commit**

```bash
curl -s "https://api.data.gov.my/weather/forecast?contains=St014@location__location_id&limit=1" | head -c 600
npx tsc --noEmit
git add src/api/datasets/weatherForecast.ts
git commit -m "feat(api): add useWeatherForecastQuery for METMalaysia 7-day forecast"
```

---

## Task 21: `useWeatherWarningQuery` hook

**Files:**
- Create: `src/api/datasets/weatherWarning.ts`

- [ ] **Step 1: Create the file**

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface WeatherWarningRow {
  warning_issue: { issued: string; title_en: string; title_bm: string };
  heading_en: string;
  heading_bm: string;
  text_en: string;
  text_bm: string;
  instanceID: string;
  valid_from: string;
  valid_to: string;
}

const QUERY_KEY = ['weather', 'warning'] as const;
const STALE_15M = 15 * 60 * 1000;

async function fetchWarnings(): Promise<WeatherWarningRow[]> {
  const rows = await apiGet<WeatherWarningRow[]>('/weather/warning', {
    sort: '-warning_issue__issued',
    limit: 5,
  });
  const now = Date.now();
  return rows.filter((r) => {
    const validTo = new Date(r.valid_to).getTime();
    return Number.isFinite(validTo) ? validTo > now : true;
  });
}

export function useWeatherWarningQuery(): UseQueryResult<WeatherWarningRow[]> {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWarnings,
    staleTime: STALE_15M,
  });
}
```

- [ ] **Step 2: Verify shape and commit**

```bash
curl -s "https://api.data.gov.my/weather/warning?limit=1" | head -c 600
npx tsc --noEmit
git add src/api/datasets/weatherWarning.ts
git commit -m "feat(api): add useWeatherWarningQuery filtered to active warnings"
```

---

## Task 22: `useRidershipHeadlineQuery` hook

**Files:**
- Create: `src/api/datasets/ridershipHeadline.ts`

- [ ] **Step 1: Create the file**

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

export interface RidershipHeadlineRow {
  date: string;
  rail_lrt_ampang: number;
  rail_mrt_kajang: number;
  rail_mrt_pjy: number;
  rail_lrt_kj: number;
  rail_monorail: number;
  rail_ktm: number;
  bus_rkl: number;
  bus_rkn: number;
  bus_rpn: number;
}

const QUERY_KEY = ['datasets', 'ridership_headline'] as const;
const STALE_6H = 6 * 60 * 60 * 1000;

async function fetchRidership(limit: number): Promise<RidershipHeadlineRow[]> {
  return apiGet<RidershipHeadlineRow[]>('/data-catalogue', {
    id: 'ridership_headline',
    sort: '-date',
    limit,
  });
}

export function useRidershipHeadlineQuery(
  limit = 30,
): UseQueryResult<RidershipHeadlineRow[]> {
  return useQuery({
    queryKey: [...QUERY_KEY, limit],
    queryFn: () => fetchRidership(limit),
    staleTime: STALE_6H,
  });
}
```

> Note: column names guessed from dataset metadata. Verify against `https://api.data.gov.my/data-catalogue?id=ridership_headline&limit=1` and adjust the interface.

- [ ] **Step 2: Verify and commit**

```bash
curl -s "https://api.data.gov.my/data-catalogue?id=ridership_headline&limit=1" | head -c 600
npx tsc --noEmit
git add src/api/datasets/ridershipHeadline.ts
git commit -m "feat(api): add useRidershipHeadlineQuery for daily transit ridership"
```

---

## Task 23: `IndicatorTile` and `IndicatorStrip`

**Files:**
- Create: `src/components/feature/IndicatorTile.tsx`
- Create: `src/components/feature/IndicatorStrip.tsx`

- [ ] **Step 1: Create `IndicatorTile.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { MiniSparkline } from '@/components/chart/MiniSparkline';

interface IndicatorTileProps {
  label: string;
  value: string;
  hint?: string;
  emoji?: string;
  spark?: number[];
  trend?: 'up' | 'down' | 'flat';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function IndicatorTile({
  label,
  value,
  hint,
  emoji,
  spark,
  trend = 'flat',
  onPress,
  style,
}: IndicatorTileProps) {
  const T = useTheme();
  const Wrapper: typeof View | typeof Pressable = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: T.colors.surface,
          borderColor: T.colors.border,
          borderRadius: T.radius.lg,
          padding: T.spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label }}>{label}</Text>
        {emoji && <Text style={{ fontSize: 16 }}>{emoji}</Text>}
      </View>
      <Text
        style={{
          fontFamily: T.fonts.display,
          fontSize: T.fontSize.hero,
          color: T.colors.text,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      {hint && (
        <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.label, marginTop: 2 }}>
          {hint}
        </Text>
      )}
      {spark && spark.length > 1 && (
        <View style={{ marginTop: 8 }}>
          <MiniSparkline data={spark} width={140} height={28} trend={trend} />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 168,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
```

- [ ] **Step 2: Create `IndicatorStrip.tsx`**

```tsx
import { ScrollView, StyleSheet } from 'react-native';
import { useExchangeRateQuery } from '@/api/datasets/exchangeRate';
import { useWeatherForecastQuery } from '@/api/datasets/weatherForecast';
import { useWeatherWarningQuery } from '@/api/datasets/weatherWarning';
import { useRidershipHeadlineQuery } from '@/api/datasets/ridershipHeadline';
import { useLocation } from '@/hooks/useLocation';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { IndicatorTile } from './IndicatorTile';

export function IndicatorStrip() {
  const T = useTheme();
  const { state } = useLocation();
  const { t } = useI18n();

  const weather = useWeatherForecastQuery(state.metLocationId);
  const warning = useWeatherWarningQuery();
  const fx = useExchangeRateQuery(['USD']);
  const ridership = useRidershipHeadlineQuery(7);

  const today = weather.data?.[0];
  const usd = fx.data?.[0];
  const ridershipPoints = (ridership.data ?? [])
    .map((r) => r.rail_lrt_kj + r.rail_mrt_kajang + r.rail_mrt_pjy + r.rail_lrt_ampang + r.rail_monorail + r.rail_ktm)
    .reverse();
  const ridershipLatest = ridershipPoints[ridershipPoints.length - 1];
  const ridershipPrev = ridershipPoints[ridershipPoints.length - 2];
  const ridershipTrend: 'up' | 'down' | 'flat' =
    ridershipLatest === undefined || ridershipPrev === undefined
      ? 'flat'
      : ridershipLatest > ridershipPrev
        ? 'up'
        : ridershipLatest < ridershipPrev
          ? 'down'
          : 'flat';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: T.spacing.xl, gap: T.spacing.sm }]}
    >
      <IndicatorTile
        label={t('cadence.daily')}
        value={today ? `${today.min_temp}–${today.max_temp}°C` : '—'}
        hint={today ? today.summary_forecast : ''}
        emoji="⛅"
      />
      {warning.data && warning.data.length > 0 && (
        <IndicatorTile
          label="Warning"
          value="⚠️"
          hint={warning.data[0].heading_en}
          emoji="⚠️"
        />
      )}
      <IndicatorTile
        label="USD/MYR"
        value={usd ? usd.rate.toFixed(4) : '—'}
        hint={usd?.date}
        emoji="💱"
      />
      <IndicatorTile
        label="Transit ridership"
        value={ridershipLatest ? new Intl.NumberFormat().format(ridershipLatest) : '—'}
        hint="rail+bus, yesterday"
        spark={ridershipPoints}
        trend={ridershipTrend}
        emoji="🚆"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 4 },
});
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/feature/IndicatorTile.tsx src/components/feature/IndicatorStrip.tsx
git commit -m "feat(home): add IndicatorTile and IndicatorStrip composing 4 daily feeds"
```

---

## Task 24: Wire `IndicatorStrip` into Home

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Add the strip between greeting and Featured**

Add the import:
```tsx
import { IndicatorStrip } from '@/components/feature/IndicatorStrip';
```

Find the Featured section's containing `<View>`. Add a NEW `<View>` block BEFORE it (i.e., between the greeting and Featured):

```tsx
        <View>
          <SectionHead
            titleMs={language === 'ms' ? 'Hari ini' : 'Today'}
            titleEn={t('home.indicators').toUpperCase()}
          />
        </View>
        <IndicatorStrip />
```

Add `language` back to the `useI18n` destructure (`const { t, language } = useI18n();`) since the new `SectionHead` titleMs uses it.

(The `IndicatorStrip` is rendered OUTSIDE the screen's standard `padding: T.spacing.xl` because it owns its own horizontal padding for the scroll experience. So move it OUT of the `ScrollView`'s `contentContainerStyle` padding wrapper if the screen wraps everything. Actually keep it inside — it negates the parent padding via `paddingHorizontal: T.spacing.xl` on its own contentContainer. Effective horizontal padding ends up doubled, fix by adding `marginHorizontal: -T.spacing.xl` to its wrapping `<View>` if visually needed. For Plan 02 v1, leave as-is — visual polish is Plan 03 concern.)

- [ ] **Step 2: Manual verification**

Run on Expo Go. Home should show:
- Greeting + screen title
- "Today / HARI INI" section head + horizontal-scrollable strip with weather, optional warning tile, USD/MYR, transit ridership
- Featured fuel tile (existing)

Each tile should populate within ~2-3 seconds on first launch (API calls in parallel).

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat(home): mount IndicatorStrip between greeting and featured tile"
```

---

## Phase F — Final verification (Task 25)

---

## Task 25: Final regression check + tag

**Files:** none modified.

- [ ] **Step 1: Typecheck and Android export**

```bash
cd C:\Users\aminm\Documents\Projects\GovExplorer
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/govexplorer-plan02-final 2>&1 | tail -5
```

Expected: clean, bundles.

- [ ] **Step 2: Cold-start checklist on Expo Go**

Walk through:
- [ ] Fresh install (or cleared AsyncStorage): app routes to onboarding.
- [ ] Onboarding card 1: intro text renders in current language.
- [ ] Onboarding card 2: theme + language pickers work; theme change is live; language change updates copy.
- [ ] Onboarding card 3: state list scrolls; tapping highlights; "Use my location" requests permission and either matches or shows the failure alert.
- [ ] "Get started" persists onboarding.completed and lands on Home.
- [ ] Subsequent launches skip onboarding.
- [ ] Home: greeting (correct time-of-day), today's IndicatorStrip with 4 tiles, featured fuel card.
- [ ] Tap fuel card → detail screen now shows the LineChart between high/low/avg and the history list.
- [ ] Detail back button works (pop or replace fallback).
- [ ] Pull-to-refresh on detail no longer flickers on background revalidation.
- [ ] Tab bar shows 4 tabs; Catalogue/Saved show "Coming in Plan 03".
- [ ] Settings: appearance pickers persist; location picker expands and saves; about section shows version.
- [ ] Theme toggle (device dark) updates everything live with no flash.
- [ ] Language toggle (device language) flips greeting + tab labels + section heads.
- [ ] Airplane mode + pull-to-refresh on detail → retry tile appears, recovers when network returns.

- [ ] **Step 3: Tag the milestone**

```bash
git tag plan-02-shell-and-indicators-complete
```

Don't push.

- [ ] **Step 4: Plan summary commit (if any cleanup needed; otherwise skip)**

If you noticed anything during the cold-start checklist that needs a small fix-up, do it as a single commit with a `fix(v1):` prefix and re-tag. Otherwise the tag is final.

---

## What ships at the end of Plan 02

- Plan 01 follow-ups resolved (i18n leaves type, expo-localization, theme hydration, font timeout, dataset detail nav, web platform).
- 4-tab navigation (Home, Catalogue, Saved, Settings).
- 3-card onboarding flow with persistence and root-layout gating.
- Settings screen functional: theme picker, language picker, location picker, about section.
- Real LineChart on FuelDetail.
- Daily IndicatorStrip on Home with weather, optional warning, USD/MYR, transit ridership.
- Foundation for Plan 03 (curated dataset detail screens) and Plan 04 (live transit).

## What's deferred to Plan 03

- Curated detail screens for: PriceCatcher, car/motorcycle registrations, blood donations, payment instruments, CPI, monthly labour force, arrivals, population by district, crime by district, household income, birthday popularity.
- Catalogue tab populated with the curated list.
- Saved tab populated from a `useFavourites` hook.
- Featured tile rotation logic on Home.
- Polish: section-head EN-redundancy fix, off-grid padding cleanup, lucide icons replacing the literal `›` in SectionHead, accessibility labels on primitives.

## What's deferred to Plan 04

- GTFS-Static parser (ZIP unzip + CSV parse for routes/stops/trips).
- GTFS-Realtime protobuf decoder (vehicle positions, 30s polling).
- Map rendering (`react-native-maps`).
- Transit screen wiring KTMB + Rapid KL feeds with a live vehicle-position map.
