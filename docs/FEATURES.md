# Features

Screen-by-screen breakdown of what ships in v1.

---

## Onboarding (first run)

3-slide animated walkthrough, modal-presented over the tab navigator.

| Slide | Hook |
|---|---|
| 1 — *Malaysia, at a glance* | Sets up the "daily pulse" promise |
| 2 — *Explore by map* | Frames the map tab |
| 3 — *Beautiful insights* | Frames the insights tab |

Skip button always available. On completion, persists `onboarded: true` and routes to `(tabs)`.

---

## Today

The home tab. The goal: a person opens the app each morning and feels like Malaysia *just woke up too*.

**Composition (top to bottom):**

| Block | Component | Notes |
|---|---|---|
| Greeting + streak chip | `Greeting` | Time-of-day aware. Streak chip only shows for streaks ≥ 2. |
| Pulse hero | `PulseHero` | One marquee stat with a live indicator dot pulsing on the UI thread. |
| 2×2 stat tiles | `StatTile` | Currency, transit, weather, unemployment. Staggered entrance. |
| Surprise reveal | `SurpriseCard` | Tap to reveal a "did you know" fact. Spring rotation animation. |

**Light gamification:**
- Daily-open streak persisted in `AsyncStorage` (`StorageKeys.streak*`).
- Streak chip uses gold tokens, never red — encouragement, not anxiety.

---

## Explore

Map-first tab.

**v1 placeholder:** Coming-soon card with a compass icon and feature description. **v1.1** ships:
- SVG topology of Malaysia (13 states + 3 federal territories)
- Tap-to-zoom with Reanimated transitions
- Per-state drawer with curated stats
- Optional transit-vehicle overlay (GTFS-Realtime vehicle positions)

Build approach: a single `react-native-svg` `<Svg>` with paths for each region, gestures via `react-native-gesture-handler`, transitions via Reanimated shared values.

---

## Insights

Category list → chart screen pattern.

| Category | Datasets (planned) |
|---|---|
| Economy & finance | Inflation, GDP, MYR FX, fuel prices, reserves |
| Transit & mobility | MRT/LRT ridership, accidents, vehicle registrations |
| Climate & environment | Weather, rainfall, AQI, water levels |
| Population & society | Population by state, births/deaths, unemployment, household income |

Each chart screen ships with:
- Hero number with delta
- Primary visualisation (`react-native-gifted-charts` or bespoke `react-native-svg`)
- "Beautiful card" share affordance — render to PNG and share-sheet out
- Source attribution row (agency, last-updated date, link to data.gov.my)

---

## Settings

Minimal:
- Appearance (`system` / `light` / `dark`)
- Language (`English` / `Bahasa Melayu`)
- Location (city — used for weather; defaults to Kuala Lumpur)
- About (data source, app version)

No account, no sync, no notifications in v1.

---

## Saved (deferred from v1)

Long-press an insight card to save it locally. Saved items live in a screen accessed from a Settings entry. Not a tab. Considered v1.2.
