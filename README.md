# GovExplorer

A beautifully crafted React Native app that brings Malaysian open data to life — daily pulse, interactive map, editorial-grade insights, and an AI assistant. Powered by `data.gov.my`.

Built with **Expo (SDK 54)** + **React Native** + **TypeScript** + **TanStack Query** + **Reanimated**.

## Screenshots

*Coming soon — dark & light mode previews*

## Features

| Feature | Description |
|---------|-------------|
| 🌅 **Today** | Daily pulse of Malaysia — population, currency, rail ridership, weather, with a "surprise stat" reveal |
| 🗺️ **Explore** | Interactive Malaysia map (13 states + 3 federal territories) — tap a state to dive into its story *(v1.2)* |
| 📈 **Insights** | Editorial chart screens across Economy, Transit, Climate, and Society — built for delight, not dashboards *(v1.1)* |
| ✨ **AI assistant** | Tap the floating button mid-tab-bar to chat with an AI guide to Malaysia's data *(placeholder; v2 wires the LLM)* |
| ℹ️ **About** | App identity, settings (theme + language pickers via bottom-sheet), data attribution, legal links |
| 🌗 **Dark & Light** | Auto-matches the system; manual override; native window background tracks the theme |
| 🌍 **EN + Bahasa Melayu** | First-class bilingual support; auto-detected, manually switchable via bottom sheet |
| 👻 **No login, ever** | All preferences in `AsyncStorage`. Privacy by default |

## Design

- **Editorial + Civic-tech** — magazine-grade typography, generous whitespace, restrained color, data-forward
- **Palette** — Deep midnight blue (`#1B365D`) + hibiscus accent (`#E63946`) + warm gold (`#C8993A`) + cream/ink neutrals
- **Typography** — **Inter** across the board (300 → 800), tabular figures for numerics. Used by Figma / Linear / Vercel / Stripe — the de-facto modern app font
- **Motion** — Reanimated worklets; spring physics for taps, eased timings for reveals, scroll-aware blurred tab bar (opaque at rest → frosted glass as content scrolls under)

See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

## Quick Start

### Prerequisites
- Node 20+
- Expo CLI (auto-installed via `npx expo`)
- iOS Simulator / Android Emulator, or an Expo Go device

### Install & Run

```bash
npm install
npm run start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go.

### Platform-specific

```bash
npm run ios       # builds a dev client and installs (expo run:ios)
npm run android   # builds a dev client and installs (expo run:android)
npm run web
```

> **Note on installs.** The project has `.npmrc` with `legacy-peer-deps=true` because Expo SDK 54 + React 19 has known peer-dep conflicts. Use `npx expo install <pkg>` rather than raw `npm install` when adding Expo modules so versions stay pinned to the SDK.

## Project Structure

```
app/                          # expo-router file-based routes
├── _layout.tsx               # Root: providers (theme, i18n, scroll, query), fonts, splash
├── (tabs)/                   # Bottom-tab group
│   ├── _layout.tsx           # Custom floating tab bar
│   ├── index.tsx             # Today
│   ├── explore.tsx           # Map (placeholder)
│   ├── insights.tsx          # Insights index
│   └── settings.tsx          # About page (with inline preference pickers)
├── chat.tsx                  # AI assistant modal route (placeholder)
└── onboarding.tsx            # First-run animated walkthrough

src/
├── theme/                    # Tokens (palette, S, R, Motion, TAB_BAR_CLEARANCE) + ThemeProvider
├── i18n/                     # EN + MS dictionaries + I18nProvider
├── lib/                      # api client, queryClient, storage, format
├── components/
│   ├── ui/                   # Text, Card, Tap, Stack, Badge, Screen, BottomSheet
│   ├── nav/                  # Floating blurred tab bar with center AI FAB
│   └── system/               # ScreenEnter, ScrollContext (UI plumbing)
└── features/
    ├── today/                # Greeting, PulseHero, StatTile, SurpriseCard
    ├── explore/              # (placeholder)
    └── insights/             # (placeholder)
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — App architecture, providers, navigation, data flow, motion patterns
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — Colors, type, spacing, motion, components
- [docs/FEATURES.md](docs/FEATURES.md) — Detailed feature breakdown
- [docs/ROADMAP.md](docs/ROADMAP.md) — Milestones and shipping plan
- [docs/SETUP.md](docs/SETUP.md) — Local development setup
- [docs/API.md](docs/API.md) — `api.data.gov.my` integration patterns
- [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) — Curated dataset catalogue
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — Coding conventions and PR flow

## Data

All data is sourced from the Government of Malaysia's open data portal — [`data.gov.my`](https://data.gov.my) — via [`api.data.gov.my`](https://developer.data.gov.my). No third-party data dependencies.

## License

MIT — see [LICENSE](LICENSE).
