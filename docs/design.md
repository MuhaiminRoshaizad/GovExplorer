# GovExplorer v1 — Design Spec

**Date:** 2026-05-09
**Status:** Approved for implementation planning
**Owner:** minned

## Summary

GovExplorer v1 is a no-login mobile app that surfaces Malaysian government open data from `api.data.gov.my` in a daily-glance dashboard, a curated set of bespoke detail screens, and a live transit map. The app is a side project for learning React Native; the build prioritises idiomatic, well-supported choices over novelty. Single source — no third-party data dependencies.

This spec covers v1 only. LLM / "Ask AI" features are explicitly deferred to v2.

## Goals

- Daily-useful: a user can open the app and see fresh, location-relevant indicators in under 2 seconds.
- Stack-learning: cover the parts of React Native that a single-screen app doesn't (navigation, charts, theming, persistence, multi-source data).
- Honest about cadence: every dataset is presented at its publishing agency's native frequency; nothing is faked daily.
- No login, ever. Personalisation lives in `AsyncStorage`.

## Non-goals (v1)

- LLM / Ask AI features.
- GTFS-Realtime trip updates and service alerts (data.gov.my hasn't published these yet — v1 ships vehicle positions only).
- Cross-device sync, accounts, server-side state.
- Generic catalogue browser. The app shows curated, polished detail screens for ~15 hand-picked datasets — not all 397.
- Third-party data dependencies (`aqicn.org`, `api.waktusolat.app`, BNM's separate API). v1 is single-source on `api.data.gov.my`.
- Automated tests (test scaffolding is staged but no tests are required).

## Scope

### Navigation

Bottom tab bar (`expo-router` v3, file-based) with 4 tabs:

| Tab | Route | Purpose |
|---|---|---|
| Utama / Home | `app/(tabs)/index.tsx` | Daily-glance dashboard |
| Katalog / Catalogue | `app/(tabs)/catalogue.tsx` | Searchable curated list |
| Simpan / Saved | `app/(tabs)/saved.tsx` | Hearted datasets |
| Tetapan / Settings | `app/(tabs)/settings.tsx` | Theme, language, location, about |

Stack on top of the tabs:

- `app/dataset/[id].tsx` — dataset detail (chart + history + API endpoint card + download).
- `app/onboarding.tsx` — 3-card first-launch flow.

### Onboarding (first launch only)

Three swipeable cards, persisted via AsyncStorage flag:

1. **What is GovExplorer** — short explainer + sources.
2. **Pilih bahasa & tema** — language (BM / EN / Auto) and theme (Klasik / Midnight / Auto).
3. **Pilih lokasi** — state picker (KL default at top, then alphabetical) plus a one-tap "Use my location" button. If geo permission denied, manual picker is the fallback. No nagging, no second prompt.

### Datasets wired up for v1

Reshaped 2026-05-09 after a deep audit of the 397 datasets at `api.data.gov.my` (audit results: `docs/data-audit.md`). The list now reflects what's actually available, mobile-friendly, and interesting — not what we guessed from memory. Single source: `api.data.gov.my`. No third-party data dependencies in v1.

**Selection criteria:** small payload, time-series or compelling categorical shape, "alive" cadence, broad public interest.

**Daily indicator strip on Home (real-time-ish):**
- **Weather forecast** — `api.data.gov.my/weather/forecast`, scoped to user's state.
- **Active weather warnings** — `api.data.gov.my/weather/warning` (only render when non-empty; quiet by default).
- **USD/MYR exchange rate** — `data-catalogue?id=exchangerates_daily_1200` (BNM 12:00 fix, sourced through data.gov.my so single base URL).
- **Public transport ridership (yesterday)** — `data-catalogue?id=ridership_headline&limit=1&sort=-date`. Pairs naturally with the live transit screen.

**Weekly:**
- **Fuel prices** (`fuelprice`) — RON95, RON97, Diesel, Budi95 subsidy. *Already wired in Plan 01.*

**Daily, but presented as monthly trend on detail screens:**
- **PriceCatcher** (`pricecatcher`) — KPDN's daily transactional retail prices for the basket of essentials (rice, eggs, chicken, cooking oil, etc.) across markets. The single highest-data-journalism-value dataset on the entire portal.
- **Daily car registrations** (`registration_transactions_car`) — by make and model. Powers the "most popular car bought in Malaysia" angle the user specifically asked for.
- **Daily motorcycle registrations** (`registration_transactions_motorcycle`).
- **Daily blood donations** (`blood_donations`) — by 8 ABO/Rh combinations. "Is your blood type in demand right now?"
- **Daily payment instruments** (`payment_instruments`) — cards vs e-wallets vs cheques. Cashless trend.

**Monthly:**
- **Consumer Price Index — headline** (`cpi_headline`) — inflation by 2-digit COICOP division.
- **Labour force — monthly** (`lfs_month`) — unemployment rate, participation rate.
- **Tourist arrivals** (`arrivals`) — by nationality and sex.
- **Air pollution monthly aggregate** (`air_pollution`) — DOSM's monthly rollup. (Real-time AQI deferred until DOE publishes a first-party API.)

**Annual / static:**
- **Population by district** (`population_district`) — paired with `crime_district` for a per-capita crime view.
- **Crimes by district** (`crime_district`).
- **Household income by district** (`hh_income_district`).
- **Birthday popularity** (`birthday_popularity` — *id pending live verification*) — share-my-birthday novelty tool.

**Live transit (NEW for v1, was deferred to v2):**
- **GTFS-Static** — `api.data.gov.my/gtfs-static/{ktmb,prasarana}` returns ZIPs containing `routes.txt`, `stops.txt`, `trips.txt`. Decoded once, cached on device, used for route/station joins.
- **GTFS-Realtime vehicle positions** — `api.data.gov.my/gtfs-realtime/vehicle-position/{ktmb|prasarana?category=...}`. Protobuf, 30-second update cadence. Vehicle position only — trip updates and service alerts are still in the data.gov.my pipeline, not yet exposed.
- Coverage in v1: KTMB Komuter + intercity, Rapid KL (LRT/MRT/monorail/bus), MRT feeder buses. Penang/Kuantan and BAS.MY (state stage buses) deferred to a later release; Penang is also flagged for known trip-ID mismatches in the docs.

**Explicitly dropped from the original design (no first-party API exists, and v1 has a hard rule against third-party deps):**
- ~~Air quality (DOE / `aqicn.org`)~~ — no first-party endpoint.
- ~~Dam water levels (JPS)~~ — only HTML portal, no API.
- ~~Prayer times (JAKIM)~~ — only community scraper `api.waktusolat.app`.
- ~~BNM separate API~~ — `data-catalogue?id=exchangerates_daily_1200` covers FX from the same single base URL. (Kijang Emas, OPR, base rates would have been BNM-only; not worth a second base for v1.)

The README's "Coming when the publishing agency adds an API" footer lists these so users understand the gaps are upstream, not a TODO on this app.

All datasets fetched from the existing `apiGet` client. One file per dataset under `src/api/datasets/` exporting `useXxxQuery`. The `bnm` and `metMalaysia` named bases added in Plan 01 are now unused — deferred for cleanup in a Plan 03 polish pass; no harm in leaving them.

### Location strategy

- User's state is captured during onboarding and stored in AsyncStorage (`location.state`).
- Settings screen exposes a "Lokasi" row to change it any time.
- Location-aware datasets (weather, state-scoped CPI/unemployment, district-scoped population/crime/income) read from `useLocation()`.
- Datasets without state granularity (national fuel prices, exchange rates) ignore location.
- State-scoped datasets that have nationwide views (CPI, unemployment) provide a "View nationwide" toggle on their detail screen.

## Visual design

### Palette — Editorial neutral

**Light (`Klasik`):**
| Token | Value |
|---|---|
| `bg` | `#FBFAF7` (warm off-white) |
| `bgAlt` | `#F4F2EC` |
| `surface` | `#FFFFFF` |
| `text` | `#14181F` (ink) |
| `textMuted` | `#5C6573` |
| `border` | `#E8E5DD` |
| `primary` | `#1E3A5F` (deep navy-blue) |
| `primarySoft` | `#E6ECF4` |
| `accent` | `#B45309` (muted amber/ochre) |
| `accentSoft` | `#FBEFD9` |
| `success` | `#15803D` |
| `danger` | `#B91C1C` |

**Dark (`Midnight`):**
| Token | Value |
|---|---|
| `bg` | `#0E1014` |
| `bgAlt` | `#15181F` |
| `surface` | `#181B22` |
| `text` | `#F2F0EB` |
| `textMuted` | `#8B92A1` |
| `border` | `#232730` |
| `primary` | `#7BA7D9` |
| `primarySoft` | `#1A2434` |
| `accent` | `#F59E0B` |
| `accentSoft` | `#2A1F0E` |
| `success` | `#22C55E` |
| `danger` | `#EF4444` |

Both themes share the same shape (`colors`, `spacing`, `radius`, `typography`) so components branch on values, never on theme name.

### Typography

| Role | Font | Use |
|---|---|---|
| Display | Plus Jakarta Sans (700/800) | Section heads, hero numbers |
| Body | System (San Francisco / Roboto) | Copy, UI labels |
| Mono | SF Mono / Roboto Mono | Agency badges, API endpoints, % deltas |

Type scale: 28 (screen title) / 22 (hero stat) / 18 (section head) / 14 (body) / 12 (label) / 11 (mono caps). Plus Jakarta Sans loaded via `expo-font`.

### Iconography

`lucide-react-native` only. ~30 icons total. 1.8 stroke. Emoji used only for category illustrations on Home (e.g. ⛅ for weather card), never for tab bar or interactive affordances.

### Card system

Three variants — that's the entire library:

1. **Surface card** — `surface` bg, 1px `border`, `radius 16`. Default for everything (trending rows, stat cards, list rows).
2. **Hero card** — gradient `primary → primary-deep`, dot-pattern overlay, single amber star motif. Used only on Home featured tile and dataset-detail hero.
3. **Code card** — always-dark bg (regardless of theme), mono text. Used only on the dataset detail "API Akses" block.

No drop-shadow stacks. Borders + a single subtle shadow on the hero card only.

### Bilingual treatment

- Section heads pair BM (larger) with EN secondary (mono caps, muted): `Sedang Hangat` / `TRENDING NOW`.
- Body copy and labels switch wholesale based on language setting.
- Default language follows device locale (BM if `ms-MY`, else EN). Override in Settings.

### Motion

- 150ms fades on theme/language change.
- Tab transitions: native default.
- Skeleton shimmer on data loads, not spinners.
- Chart entry animations via `react-native-reanimated`.
- Haptic feedback (`expo-haptics`) on tab change and pull-to-refresh trigger.

## Architecture

### Tech stack

| Concern | Choice | Why |
|---|---|---|
| Routing | `expo-router` v3 | Default for new Expo, file-based, what the docs lead with |
| Server state | `@tanstack/react-query` | Industry standard, per-dataset `staleTime` matches publishing cadence |
| Charts | `victory-native` (Skia) | 60fps, gesture support, maintained by Shopify |
| Animations | `react-native-reanimated` + `react-native-gesture-handler` | Required by victory-native; used for shimmers + transitions |
| Persistence | `@react-native-async-storage/async-storage` | Standard for non-secret KV |
| Icons | `lucide-react-native` | Single library, line style, well-maintained |
| Fonts | `expo-font` | Plus Jakarta Sans loaded at startup |
| Location | `expo-location` | Optional — user can decline and use manual picker |
| i18n | Hand-rolled (~50 strings, 2 langs) | `react-i18next` is overkill for this scope |
| Styling | `StyleSheet.create` + theme context | NativeWind/Tamagui adds dependency surface for marginal gain |

### Folder structure (post-migration)

```
app/                          # expo-router routes
  (tabs)/
    _layout.tsx               # tab bar config
    index.tsx                 # Home
    catalogue.tsx
    saved.tsx
    settings.tsx
  dataset/[id].tsx            # detail screen
  onboarding.tsx
  _layout.tsx                 # root: providers (Query, Theme, SafeArea, GestureHandler)
src/
  api/
    client.ts                 # existing, kept as-is
    datasets/
      fuelPrice.ts            # existing logic moved + wrapped in useFuelPriceQuery
      cpi.ts
      unemployment.ts
      births.ts
      vehicleRegistrations.ts
      populationState.ts
      weather.ts              # METMalaysia
      aqi.ts                  # DOE
      exchangeRate.ts         # BNM
      damLevels.ts            # JPS via data.gov.my
  components/
    ui/
      Card.tsx
      StatCard.tsx
      Chip.tsx
      SectionHead.tsx
      Skeleton.tsx
      DataView.tsx            # loading/error/empty wrapper
    chart/
      MiniSparkline.tsx
      LineChart.tsx
      BarChart.tsx
    feature/
      FeaturedTile.tsx
      TrendingRow.tsx
      IndicatorStrip.tsx
      DatasetHeader.tsx
  theme/
    index.ts                  # lightTheme, darkTheme, ThemeProvider, useTheme
    typography.ts
    spacing.ts
  i18n/
    index.ts                  # t(key, lang)
    en.ts
    ms.ts
  hooks/
    useSetting.ts
    useLocation.ts
    useFavourites.ts
  types/
    dataset.ts
    fuelPrice.ts              # existing
docs/
  superpowers/
    specs/                    # this file
```

### Theme system

- `lightTheme` and `darkTheme` exported from `src/theme/index.ts`, identical shape.
- `ThemeProvider` wraps the app at `app/_layout.tsx`. Reads:
  - `useColorScheme()` for system preference (live, re-renders when system changes).
  - User override from AsyncStorage (`'light' | 'dark' | 'system'`, default `'system'`).
- Resolved theme exposed via `useTheme()` hook. Components do `const T = useTheme()` and read `T.colors.primary`. No component branches on theme name.
- StatusBar style swaps with theme.
- Settings screen has a 3-way segmented control: **Auto / Klasik / Midnight**.
- Code-card is the one intentional exception — it stays dark in both themes (defined as a separate `T.colors.codeBg` token).

### Data fetching pattern

Each dataset has its own file in `src/api/datasets/` that:

1. Fetches via the shared `apiGet` client (extended to support multiple base URLs for BNM/METMalaysia/DOE).
2. Reshapes raw rows into the typed shape the UI consumes.
3. Exports a `useXxxQuery()` hook wrapping `react-query`'s `useQuery`, with `staleTime` matching native cadence:

| Cadence | `staleTime` |
|---|---|
| Hourly (AQI) | 30 min |
| Daily (weather, FX, dams) | 6 hours |
| Weekly (fuel) | 24 hours |
| Monthly (CPI, etc.) | 24 hours |
| Annual (population) | 7 days |

All screens render through a single `<DataView query={...} render={(data) => ...} />` wrapper that handles pending → skeleton, error → retry tile, empty → illustration.

### Persistence shape

AsyncStorage keys (typed via `useSetting<T>(key)` hook):

```
onboarding.completed: boolean
language: 'ms' | 'en' | 'auto'
theme: 'light' | 'dark' | 'system'
location.state: string  // e.g. 'WP_KL', 'SGR'
favourites: string[]    // dataset ids
```

### API client extension

Current `apiGet` is hard-coded to `https://api.data.gov.my`. Extend it to accept an optional `baseUrl` arg, with three named bases: `DATA_GOV_MY`, `BNM`, `MET_MALAYSIA`. DOE AQI lives under data.gov.my so doesn't need its own base.

## Screens

### Home (`app/(tabs)/index.tsx`)

Top to bottom:

1. **Greeting block** — time-of-day greeting + screen title (`Jelajah data Malaysia`) + bell icon (notifications stub for v2).
2. **Search pill** — pressable, navigates to Catalogue.
3. **Featured tile** — gradient hero card. Rotates daily across 3 curated picks (e.g. fuel today, vehicle regs tomorrow). Tap → dataset detail.
4. **Indicator strip (Harian)** — horizontal scroll of compact daily cards: weather, AQI, USD/MYR, dam level. Each shows current value + tiny sparkline + cadence tag.
5. **Trending list (Mingguan & Bulanan)** — vertical list of dataset rows: agency badge, name, sparkline, % delta vs previous period, cadence tag. (No "view count" — data.gov.my does not expose this; the inspiration prototype mocked it.)
6. **Categories grid** — 3-column, 6 categories with emoji + dataset count. Each links to a pre-filtered Catalogue.

### Catalogue (`app/(tabs)/catalogue.tsx`)

- Sticky header: title + search input + horizontally scrollable category chips.
- Vertical list of dataset rows with agency badge, name, cadence tag, % delta, heart toggle.
- Filter state (search query + category) is screen-local.

### Dataset detail (`app/dataset/[id].tsx`)

- Top bar: back, title (`Dataset`), heart toggle, share.
- Source badge + cadence + last-updated date.
- Title + bilingual description.
- Hero stat card: latest value (large), delta vs previous, range chips (1M / 3M / 6M / 1Y / 5Y / Max), chart, line/bar toggle.
- Quick stats row: High / Low / Avg.
- API endpoint card (always-dark): GET URL + "Try in Playground" + share button.
- Download row: CSV / Parquet / JSON buttons (link out to data.gov.my native download URLs).

### Saved (`app/(tabs)/saved.tsx`)

- Empty state if no favourites: illustration + CTA to Catalogue.
- Otherwise: same row layout as Catalogue, filtered to `favourites[]`.

### Settings (`app/(tabs)/settings.tsx`)

Grouped rows:
- **Penampilan / Appearance** — theme (Auto / Klasik / Midnight), language (Auto / BM / EN).
- **Lokasi / Location** — state picker, "Use my location" trigger.
- **Mengenai / About** — version, data sources (links out), GitHub repo, license.

## Error handling

Every data fetch goes through React Query, surfaced via `<DataView>`:

- **Pending** → skeleton shimmer matching the eventual layout (not a spinner).
- **Error** → tile with short message + "Cuba lagi / Retry" button. Network errors and 5xx surface generically; `fetch` failures show "Tiada sambungan / No connection".
- **Empty** → small illustration + one-line explanation. Used when API returns `[]` (rare but possible for state-scoped queries).

No try/catch in screens; React Query handles it. Errors logged to console in dev only.

## Testing

Skipped for v1. Tradeoff acknowledged: side project, learning-focused, fast iteration matters more than regression coverage at this stage.

`jest` + `@testing-library/react-native` deps and config will be added but no tests required for v1 acceptance. v2 acceptance includes unit tests for `src/api/datasets/*` reshapers and theme/i18n hooks.

## Migration from current code

The existing `FuelPriceScreen`, `PriceCard`, `PriceHistoryItem`, `fuelPrices.ts`, `apiGet`, and types are all kept and refactored:

- `getWeeklyFuelPrices` → `useFuelPriceQuery` (logic preserved, wrapped in React Query).
- `FuelPriceScreen` → split: hero card becomes `FeaturedTile` content for fuel, history table moves into `app/dataset/fuelprice.tsx` detail screen.
- `apiGet` extended with optional `baseUrl` arg.
- `App.tsx` replaced by `app/_layout.tsx` (expo-router) — `index.ts` updated accordingly.

## Acceptance criteria for v1

1. App opens to Home with all 4 daily indicators populated within 2s on warm cache.
2. All 10 datasets fetch successfully from real APIs (no mocks shipped).
3. Theme follows system by default, switchable in Settings, persists across launches.
4. Language switches between BM/EN live without restart.
5. Location set during onboarding scopes weather, AQI, dam levels.
6. Favouriting a dataset persists and surfaces in Saved.
7. Dataset detail screen renders chart for fuel prices with 1M/3M/6M/1Y range chips functional.
8. Pull-to-refresh works on every tab.
9. Both light and dark themes render every screen with no hardcoded colour leaks.
10. App runs on Android (Expo Go) and iOS Simulator without native build issues.

## Out of scope, explicitly

- Server-side anything.
- Push notifications (the bell icon is a stub).
- Sharing as image/PDF (only URL share).
- Offline mode beyond React Query's default cache.
- Accessibility audit (committed for v2 — semantic labels, dynamic type, contrast pass).
- Tablet / large-screen layouts.
