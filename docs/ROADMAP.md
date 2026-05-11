# Roadmap

## v1.0 — Foundation (current)

Goal: an opinionated, beautifully-built shell that proves the app's voice.

- [x] Tokens, theme, dark/light, EN/MS
- [x] Custom animated tab bar
- [x] Today screen with placeholder stats
- [x] Onboarding (3 slides, animated)
- [x] Settings (theme, language, about)
- [x] Explore placeholder
- [x] Insights category list

## v1.1 — Live data

- [ ] `api.data.gov.my` query hooks for each curated dataset
- [ ] Real Today stats (currency, weather, ridership, population)
- [ ] First two Insights chart screens (Economy → MYR FX; Climate → Rainfall)
- [ ] Streak counter wired
- [ ] "Today's surprise" rotating fact engine

## v1.2 — Map

- [ ] Malaysia SVG topology
- [ ] Tap-to-zoom state drawer with curated stats
- [ ] Pinch / pan
- [ ] Transit overlay (GTFS-Realtime vehicle positions)

## v1.3 — Insights depth

- [ ] All four categories with at least 5 chart screens each
- [ ] Share-as-card (render chart + caption to PNG, share-sheet)
- [ ] Save-locally for insight cards

## v2.0 — Stretch

- [ ] Reduced-motion respect (`AccessibilityInfo`)
- [ ] Sentry-style global error boundary
- [ ] Lightweight personalisation: home tile reordering
- [ ] Widget support (iOS WidgetKit, Android App Widgets) for Today pulse
- [ ] Push notifications for major data releases (DOSM inflation, BNM rate decisions)
