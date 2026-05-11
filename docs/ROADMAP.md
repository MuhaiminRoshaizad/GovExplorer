# Roadmap

## v1.0 — Foundation ✓ (shipped 2026-05-11)

The opinionated, beautifully-built shell that proves the app's voice.

- [x] Tokens, theme, dark/light, EN/MS
- [x] **Inter** typography across the board (swapped from Plus Jakarta Sans for professional neutral feel)
- [x] Floating, scroll-aware blurred tab bar with center AI FAB
- [x] `Screen` / `ScreenScroll` primitives with `TAB_BAR_CLEARANCE` baked in
- [x] `BottomSheet` primitive
- [x] `ScreenEnter` entrance helper
- [x] `ScrollContext` for chrome animations
- [x] Today screen with placeholder stats + animated reveals
- [x] Onboarding (3 slides, animated)
- [x] About page (formerly Settings) — hero + features + preference pickers via bottom sheet
- [x] AI Chat placeholder modal route
- [x] Explore placeholder
- [x] Insights category list
- [x] `expo-system-ui` integration so native window bg tracks theme (no white modal-dismiss flashes)
- [x] Modal-as-card presentation strategy so close animations work on Android
- [x] Full docs: README, ARCHITECTURE, DESIGN_SYSTEM, FEATURES, ROADMAP, SETUP, API, DATA_SOURCES, CONTRIBUTING

## v1.1 — Live data (in progress)

- [x] `Skeleton` primitive for loading states
- [x] `api.data.gov.my` query hooks for the first four datasets (`currency`, `fuelprice`, `ridership_headline`, `cpi_headline`) under `src/lib/queries/`
- [x] Today screen wired — 4 tiles + pulse hero pull live data with skeleton/error states
- [x] Insights screen redesigned — categories with horizontal-scrolling dataset cards
- [x] Dataset detail route (`/dataset/[id]`) with hero number, source link, and a working 30-day FX line chart
- [ ] Wire remaining curated datasets (catalogue in `src/features/insights/catalogue.ts` lists ~17 datasets; 4 are wired)
- [ ] Pull-to-refresh on Today + Insights
- [ ] Streak counter wired (`StorageKeys.streak*`)
- [ ] "Today's surprise" rotating fact engine (currently shows ridership-derived fact when available)
- [ ] Onboarding gating logic (route to `/onboarding` on first launch)

## v1.2 — Map

- [ ] Malaysia SVG topology
- [ ] Tap-to-zoom state drawer with curated stats
- [ ] Pinch / pan
- [ ] Transit overlay (GTFS-Realtime vehicle positions)

## v1.3 — Insights depth

- [ ] All four categories with at least 5 chart screens each
- [ ] Share-as-card (render chart + caption to PNG, share-sheet)
- [ ] Save-locally for insight cards

## v2.0 — AI + stretch

- [ ] Wire the AI chat composer to a real LLM (Anthropic Claude via API proxy, likely)
- [ ] Reduced-motion respect (`AccessibilityInfo`)
- [ ] Sentry-style global error boundary
- [ ] Lightweight personalisation: home tile reordering
- [ ] Widget support (iOS WidgetKit, Android App Widgets) for Today pulse
- [ ] Push notifications for major data releases (DOSM inflation, BNM rate decisions)
