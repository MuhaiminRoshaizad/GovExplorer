# Features

Screen-by-screen breakdown of what ships in v1.

---

## Onboarding (first run)

3-slide animated walkthrough, presented as a card-slide-up modal over the tab navigator.

| Slide | Hook |
|---|---|
| 1 — *Malaysia, at a glance* | Sets up the "daily pulse" promise |
| 2 — *Explore by map* | Frames the map tab |
| 3 — *Beautiful insights* | Frames the insights tab |

Skip button always available. On completion, persists `onboarded: true` and routes to `(tabs)`. Status bar style switches with theme inside the modal.

> Gating (route to `/onboarding` on first launch if not onboarded) isn't wired in v1.0 — defer until ship. Currently the modal is reachable manually for testing.

---

## Today

The home tab. The goal: a person opens the app each morning and feels like Malaysia *just woke up too*.

**Composition (top to bottom):**

| Block | Component | Notes |
|---|---|---|
| Greeting + streak chip | `Greeting` | Time-of-day aware. Streak chip only shows for streaks ≥ 2. Brand line `Malaysia, today.` is bilingual. |
| Pulse hero | `PulseHero` | Live MYR/USD rate from BNM with a pulsing indicator on the UI thread. |
| 2×2 stat tiles | `StatTile` | Wired to live data: MYR/USD (BNM), rail ridership (Prasarana), RON95 (KPDN), inflation YoY (DOSM). Each tile shows a `Skeleton` while loading and an em-dash on error. Staggered entrance via Reanimated worklets. |
| Surprise reveal | `SurpriseCard` | Tap to reveal a "did you know" fact — derived from ridership data when available. Spring rotation animation. |

**Light gamification (planned):**
- Daily-open streak persisted in `AsyncStorage` (`StorageKeys.streak*`). Logic for incrementing isn't wired in v1.0.
- Streak chip uses gold tokens, never red — encouragement, not anxiety.

---

## Explore

Map-first tab.

**v1 placeholder:** Coming-soon card with a compass icon, description, and feature badges. Uses `ScreenEnter` for fade-up entrance.

**v1.2 ships:**
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

**Layout (v1.1):** Sectioned vertical layout — one section per category. Each section has a header (icon + name + dataset count) and a **horizontal-scrolling list** of dataset cards. The horizontal list escapes `ScreenScroll`'s padding via a negative-margin trick so cards visually scroll to the screen edge.

**Dataset card** (~200×160px):
- Tone-tinted icon (top-left)
- Name + agency · cadence
- `↗` icon if wired, `SOON` badge if not yet

Tap → `/dataset/<id>` (`app/dataset/[id].tsx`) — slide-from-right card transition.

**Dataset detail screen:**
- Header (back button + agency name)
- Hero card: dataset icon + name + description
- **For wired datasets** (`currency`, `fuelprice`, `ridership_headline`, `cpi_headline`):
  - Hero number with current value, unit, delta vs previous, "as of" date
  - For `currency`: 30-day area line chart via `react-native-gifted-charts`
  - Skeleton loaders during fetch; "—" + muted "Couldn't load data" on error
- **For other datasets**: "Coming soon" hero card with the same chrome
- Source row at the bottom — tap to open the dataset page on `data.gov.my`

---

## AI Chat (placeholder, v2)

Tapping the center **Sparkles FAB** on the floating tab bar pushes `/chat` as a card slide-up modal. The placeholder includes:

- Header with title + close button
- Pulsing accent-color Sparkles avatar with halo animation
- "Coming soon" badge
- Description copy (bilingual)
- 3 sample question chips with staggered fade-in
- Disabled input bar at the bottom (visual placeholder for the future composer)

When v2 wires the LLM, only `app/chat.tsx` internals change — the route, modal presentation, FAB, and i18n strings stay.

---

## About (Settings tab, repurposed)

A SelawatHub-inspired About page that combines app identity with preferences. Tab label is "About" / "Mengenai" (the route file stays `settings.tsx` for stability).

**Composition (top to bottom):**

1. **Hero** — centered Compass logo in a brand-glow tile, "GovExplorer" + version, tagline, description (bilingual)
2. **Feature list** — 4 rows (Daily pulse, Interactive map, Editorial insights, AI assistant) with tone-tinted icons
3. **Preferences section** — two **rows with trailing value** that open `BottomSheet` pickers:
   - Appearance → System / Light / Dark
   - Language → English / Bahasa Melayu
4. **About section** — Data source, Privacy, Source code (link to GitHub)
5. **Legal section** — Terms of use, Privacy policy (placeholder rows)
6. **Footer** — "Made with care for Malaysia."

The bottom-sheet pattern (row → tap → sheet with options) mirrors SelawatHub's language picker and is more compact than inline chips.

---

## Saved (deferred from v1)

Long-press an insight card to save it locally. Saved items live in a screen accessed from a Settings entry. Not a tab. Considered v1.3.
