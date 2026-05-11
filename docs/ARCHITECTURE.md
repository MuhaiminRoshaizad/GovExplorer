# Architecture

This document describes how GovExplorer is wired together — providers, navigation, data flow, motion patterns, and the conventions that keep the codebase predictable.

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
| Blur | `expo-blur` | Native UIVisualEffectView (iOS) / fallback tint (Android) for the floating tab bar |
| System UI | `expo-system-ui` | Sets the native window background color so it tracks the theme — eliminates white flashes during modal dismiss |
| Icons | `lucide-react-native` | Crisp, consistent stroke icons |
| Charts | `react-native-gifted-charts` | Pragmatic; supplemented with `react-native-svg` for bespoke visuals |
| i18n | Local dictionaries + Context | No runtime overhead, dead-simple, EN + MS |
| Fonts | **Inter** via `@expo-google-fonts/inter` | Modern, professional, neutral — Figma / Linear / Vercel use it |

No backend, no auth, no analytics, no third-party data APIs.

---

## Provider tree

`app/_layout.tsx` mounts:

```
GestureHandlerRootView
└── SafeAreaProvider
    └── QueryClientProvider          # data caching
        └── ThemeProvider            # dark/light + tokens + native window bg
            └── I18nProvider         # EN/MS dictionaries
                └── ScrollProvider   # shared scroll Y for chrome animations
                    └── expo-router Stack
                        ├── (tabs)        # main app
                        ├── chat          # AI assistant modal
                        └── onboarding    # modal, first run
```

All four user-facing providers hydrate their state from `AsyncStorage` on mount. There is no global state library — Context is sufficient for app-level concerns, and TanStack Query owns server state.

`ThemeProvider` also pushes the active theme's `bg` color into `expo-system-ui`'s `SystemUI.setBackgroundColorAsync()` so the native Android/iOS window root tracks the theme. This kills the white flicker that React Navigation modals exhibit on dismiss when the JS-layer scene container is briefly exposed.

`ScrollProvider` exposes a single `SharedValue<number>` for the currently-active scroll offset. `ScreenScroll` writes to it via `useAnimatedScrollHandler`; the `TabBar` reads it to fade its tint overlay between opaque (at rest) and translucent (when content scrolls under). On focus change, `ScreenScroll` resets the value to 0 so a fresh tab always starts with an opaque bar.

---

## Navigation

`expo-router` file-based. Four tabs + two modal routes:

| Route | File | Purpose |
|---|---|---|
| `/(tabs)` (index) | `app/(tabs)/index.tsx` | Today — daily pulse |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | Map-first explorer (placeholder) |
| `/(tabs)/insights` | `app/(tabs)/insights.tsx` | Category list → chart screens (placeholder) |
| `/(tabs)/settings` | `app/(tabs)/settings.tsx` | About page — identity + preferences |
| `/chat` | `app/chat.tsx` | AI assistant — modal slide-up |
| `/onboarding` | `app/onboarding.tsx` | First-run modal slide-up |

### Modal presentation strategy

Both `chat` and `onboarding` use **`presentation: 'card'` + `animation: 'slide_from_bottom'`** rather than `presentation: 'modal'`. The reason:

- `presentation: 'modal'` hands off control to the OS modal lifecycle. The `animation` prop only describes the *present* animation; the dismiss uses the OS default which is frequently instant on Android.
- `presentation: 'card'` keeps the screen inside the Stack. The `animation: 'slide_from_bottom'` inverts on pop, so close *also* animates as a slide-down. Predictable both directions.

For visual chrome (rounded corners, scaling underlying screen) the iOS-native `'modal'` is fancier, but predictable motion wins for a small app like ours. `gestureEnabled: true` + `gestureDirection: 'vertical'` restores swipe-down-to-dismiss.

### Tab bar (the floating, scroll-aware blur bar)

The bar (`src/components/nav/TabBar.tsx`) is:
- **Absolutely positioned** at the bottom (`position: 'absolute'`) so scene content extends behind it
- A **rounded pill** with `overflow: 'hidden'` so the BlurView clips correctly
- Backed by `expo-blur`'s `BlurView` with tint `light`/`dark` matching theme
- Overlaid with a **theme.surface tint** whose opacity is **animated by scroll position** — `1` at scrollY=0 (opaque), `0.55` past scrollY=40 (frosted)
- Decorated with platform-appropriate shadows (iOS `shadowOpacity`, Android `elevation`)
- Topped by a circular **AI FAB** that protrudes above the bar, opens `/chat` on tap, and pulses a halo behind it

Because the bar is absolute, screen content needs to reserve room for it manually. The `Screen` and `ScreenScroll` primitives in `src/components/ui/Screen.tsx` apply `paddingBottom: insets.bottom + TAB_BAR_CLEARANCE` (110px) by default — every tab screen automatically gets correct clearance.

### Theme & language switches

No animated transition. Switching theme or language **snaps** — the standard React Native practice. (Earlier the app had a crossfade overlay; it was removed because it created a "curtain" feeling rather than feeling premium. Flutter's `themeAnimationDuration` has no built-in RN equivalent; manually animating every color via `interpolateColor` would require a global refactor. Snap is what Linear / Spotify / Things 3 / Apple Music all do.)

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
- `tokens.ts` — `S` (spacing), `R` (radius), `Z` (z-index), `Motion` (durations + springs), `TAB_BAR_CLEARANCE`
- `typography.ts` — `type` map keyed by `TypeVariant`, **Inter** font-family handles (`light`, `regular`, `medium`, `semibold`, `bold`, `extrabold`)
- `theme.ts` — light/dark Theme objects
- `ThemeProvider.tsx` — Context + `AsyncStorage` persistence + `SystemUI.setBackgroundColorAsync` on theme change (`'system' | 'light' | 'dark'`)

---

## Folder conventions

```
src/
├── theme/        # tokens + provider (no UI)
├── i18n/         # dictionaries + provider (no UI)
├── lib/          # platform/utility (api, storage, format, queryClient)
├── components/
│   ├── ui/       # generic primitives: Text, Card, Tap, Stack, Badge, Screen, BottomSheet
│   ├── nav/      # navigation components: TabBar
│   └── system/   # app-wide infrastructure: ScreenEnter, ScrollContext
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

## Motion patterns

| Concern | Pattern | Where |
|---|---|---|
| Press feedback | `Tap` primitive — spring scale (default `0.97`, FAB `0.92`) + haptic | `src/components/ui/Tap.tsx` |
| Screen entrance | `ScreenEnter` — `FadeInDown` or `FadeIn` on first mount | `src/components/system/ScreenEnter.tsx` |
| Tab switch | Cross-fade via `<Tabs screenOptions={{ animation: 'fade' }}>` | `app/(tabs)/_layout.tsx` |
| Modal slide-up / slide-down | `presentation: 'card'` + `animation: 'slide_from_bottom'` (close uses inverse) | Modal screen options |
| Bottom-sheet | `<BottomSheet>` primitive — backdrop fade (220ms) + sheet slide-up cubic (320ms) + spring-y close | `src/components/ui/BottomSheet.tsx` |
| Tab-bar tint blur | Reanimated `interpolate(scrollY, [0, 40], [1, 0.55])` on tint opacity, driven by `ScrollContext` | `TabBar.tsx` + `ScreenScroll` |
| Ambient pulses | `withRepeat(withSequence(...))` for the FAB halo + Today pulse hero | Feature-scoped |

All motion goes through Reanimated worklets — never the legacy `Animated` API. Durations and springs live in `Motion` from `src/theme/tokens.ts`.

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
