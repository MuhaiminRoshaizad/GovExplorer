# Architecture

This document describes how GovExplorer is wired together — providers, navigation, data flow, and the conventions that keep the codebase predictable.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Expo SDK 54 (RN 0.81, React 19) | Best-supported managed RN environment |
| Routing | `expo-router` v6 (file-based) | Convention over configuration; deep linking for free |
| Async data | `@tanstack/react-query` v5 | Cache, dedupe, retries, devtools — battle-tested |
| Animation | `react-native-reanimated` v4 | Runs on UI thread; necessary for premium motion |
| Gestures | `react-native-gesture-handler` | Required by Reanimated and bottom-sheet patterns |
| Storage | `@react-native-async-storage/async-storage` | Sufficient for preferences and saved items |
| Icons | `lucide-react-native` | Crisp, consistent stroke icons |
| Charts | `react-native-gifted-charts` | Pragmatic; supplemented with `react-native-svg` for bespoke visuals |
| i18n | Local dictionaries + Context | No runtime overhead, dead-simple, EN + MS |
| Fonts | `@expo-google-fonts/plus-jakarta-sans` | Editorial weight range (300–800) |

No backend, no auth, no analytics, no third-party APIs.

---

## Provider tree

`app/_layout.tsx` mounts:

```
GestureHandlerRootView
└── SafeAreaProvider
    └── QueryClientProvider          # data caching
        └── ThemeProvider            # dark/light + tokens
            └── I18nProvider         # EN/MS dictionaries
                └── expo-router Stack
                    ├── (tabs)        # main app
                    └── onboarding    # modal, first run
```

Both `ThemeProvider` and `I18nProvider` hydrate their preference from `AsyncStorage` on mount. There is no global state library — Context is sufficient for app-level concerns, and TanStack Query owns server state.

---

## Navigation

`expo-router` file-based. Four tabs:

| Route | File | Purpose |
|---|---|---|
| `/(tabs)` (index) | `app/(tabs)/index.tsx` | Today — daily pulse |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | Map-first explorer |
| `/(tabs)/insights` | `app/(tabs)/insights.tsx` | Category list → chart screens |
| `/(tabs)/settings` | `app/(tabs)/settings.tsx` | Theme, language, about |
| `/onboarding` | `app/onboarding.tsx` | First-run, modal presentation |

The tab bar (`src/components/nav/TabBar.tsx`) is custom — animated icon scale, active-tab glow, haptic on press. The default `@react-navigation/bottom-tabs` bar is not used.

---

## Data flow

```
api.data.gov.my
       │
       ▼
src/lib/api.ts          ← single fetch helper, throws ApiError on non-2xx
       │
       ▼
src/features/<feature>/api/use<Thing>Query.ts
       │  (TanStack Query hook with stable key + parser)
       ▼
src/features/<feature>/components/*  ← consume the hook, render
```

Conventions:
- One query hook per dataset, colocated under `src/features/<feature>/api/`.
- Hooks return `{ data, isLoading, isError, refetch }` — no further wrapping.
- Parsing happens in the hook (`select` or inline), so components receive view-shaped data.
- 5-minute `staleTime`, 30-minute `gcTime` by default (see `src/lib/queryClient.ts`).

---

## Theming

`src/theme/` exports a `Theme` object resolved from a `Mode` (`'light' | 'dark'`) and shared brand tokens. Components consume it via `useTheme()` — they never import `palette` directly, so dark/light is automatic.

Token files:
- `palette.ts` — raw hex values, light + dark surfaces, chart colors
- `tokens.ts` — `S` (spacing), `R` (radius), `Z` (z-index), `Motion` (durations + springs)
- `typography.ts` — `type` map keyed by `TypeVariant`, font-family handles
- `theme.ts` — light/dark Theme objects
- `ThemeProvider.tsx` — Context + `AsyncStorage` persistence (`'system' | 'light' | 'dark'`)

---

## Folder conventions

```
src/
├── theme/        # tokens + provider (no UI)
├── i18n/         # dictionaries + provider (no UI)
├── lib/          # platform/utility (api, storage, format, queryClient)
├── components/
│   ├── ui/       # generic primitives: Text, Card, Tap, Stack, Badge, Screen
│   └── nav/      # navigation components: TabBar
└── features/<feature>/
    ├── api/      # query hooks for this feature
    ├── components/  # feature-scoped composites
    └── <Feature>.tsx  # screen entry (if applicable)
```

**Rules:**
- `theme`, `i18n`, `lib` are leaf nodes — they import nothing from `features/` or `components/`.
- `components/ui` may not import from `features/`.
- `features/<a>` may not import from `features/<b>`. If two features need the same thing, it lives in `components/ui` or `lib`.
- Path alias: `@/*` → `src/*`.

---

## Persistence

`AsyncStorage` only. Keys are namespaced (`govexplorer.*`) and centralised in `src/lib/storage.ts` via `StorageKeys`. The `storage` helper wraps `getJSON` / `setJSON` / `remove` so callers never deal with stringification or thrown errors.

Persisted state today:
- Theme preference (`'system' | 'light' | 'dark'`)
- Language (`'en' | 'ms'`)
- Onboarded flag
- Streak (count + last-open date)
- Saved insights
- Home location

---

## Error handling

- Network errors bubble through TanStack Query — surface inline (`isError` branch), never globally.
- `ApiError` carries `status` for differentiated handling (404 vs 500) when needed.
- No global error boundary in v1; React Native red-box is sufficient during development. A `Sentry`-style boundary may land in v2.

---

## Testing

Not in v1. Architecture is structured so testing can land later without churn:
- Pure utilities in `src/lib/format.ts` are first targets for unit tests.
- Query hooks can be tested with `@testing-query` patterns once the suite is set up.
- Visual regression is deferred — Storybook or Chromatic is overkill for app of this size.
