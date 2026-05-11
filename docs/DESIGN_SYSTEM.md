# Design System

GovExplorer's visual language — color, type, spacing, motion, components.

---

## Philosophy

**Editorial + Civic-tech** — magazine-grade typography meets data-forward calm. The app should feel like a beautifully designed publication that happens to have live data inside, not a dashboard with charts pasted on. Restrained color. Confident type. Motion that supports meaning rather than entertains.

Influences: Apple's Health app, The Pudding, Bloomberg Beta, gov.uk, Singapore's LifeSG.

---

## Color Palette

**File:** `src/theme/palette.ts` — accessed via `useTheme()`, never imported directly by components.

### Brand colors (shared between modes)

| Token | Hex | Usage |
|---|---|---|
| `brand.deep` | `#142A47` | Largest brand surfaces |
| `brand.base` | `#1B365D` | Primary actions, active states, headlines |
| `brand.soft` | `#2E5077` | Hover/pressed; secondary surfaces |
| `brand.muted` | `#0F2237` | Highest-contrast brand variant |
| `brand.glow` | `rgba(27,54,93,0.18)` | Translucent backgrounds for selected chips/tiles |

### Accent (Malaysian hibiscus)

| Token | Hex | Usage |
|---|---|---|
| `accent.base` | `#E63946` | Highlight, accent fills, "surprise" reveal, **AI chat FAB** |
| `accent.soft` | `#F4A6AB` | Soft fills |
| `accent.glow` | `rgba(230,57,70,0.16)` | Translucent accent backgrounds, FAB halo |

### Gold (warmth, streaks, premium)

| Token | Hex | Usage |
|---|---|---|
| `gold.base` | `#C8993A` | Streaks, premium accents |
| `gold.soft` | `#E6C57A` | Softer gold for secondary accents |
| `gold.glow` | `rgba(200,153,58,0.18)` | Translucent gold backgrounds |

### Chart palette (works in both modes)

| Token | Hex | Notes |
|---|---|---|
| `chart.blue` | `#3B6FA8` | Primary series |
| `chart.coral` | `#E26D5C` | Comparison series |
| `chart.teal` | `#3E8E84` | Secondary series |
| `chart.gold` | `#C8993A` | Highlight series |
| `chart.plum` | `#7E5A8C` | Additional |
| `chart.sage` | `#7A8C5E` | Additional |

### Light mode surfaces

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FAFAF7` | Page background (warm paper) |
| `surface` | `#FFFFFF` | Cards, tab bar at rest |
| `surfaceMuted` | `#F2EFE8` | Subtle fills, sections |
| `surfaceSunken` | `#EDE9E0` | Inset elements |
| `border` | `#E5E1D6` | Default border |
| `borderStrong` | `#CFC9BB` | Emphasised dividers |

### Dark mode surfaces

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0A0D13` | Page background |
| `surface` | `#141821` | Cards, tab bar at rest |
| `surfaceMuted` | `#1B202B` | Subtle fills |
| `surfaceSunken` | `#080B11` | Inset elements |
| `border` | `#252B37` | Default border |
| `borderStrong` | `#3A4151` | Emphasised dividers |

### Text

| Token | Light | Dark |
|---|---|---|
| `text` | `#16140F` | `#ECE8DE` |
| `textSoft` | `#564F44` | `#A39E91` |
| `textMuted` | `#8A8275` | `#6A6457` |

---

## Typography

**Family:** Inter (weights 300, 400, 500, 600, 700, 800) — loaded via `@expo-google-fonts/inter`.
**File:** `src/theme/typography.ts` — variants keyed via `<Text variant="...">`.

Inter is the de-facto modern app font — used by Figma, Linear, Vercel, Stripe Press. Geometric, professional, neutral, excellent at all sizes, has tabular figures.

| Variant | Size / LH | Weight | Tracking | Usage |
|---|---|---|---|---|
| `display` | 44 / 50 | 300 | -0.8 | Onboarding titles, hero numbers |
| `numeric` | 36 / 42 | 300 | -0.6 | Big stat values |
| `hero` | 30 / 36 | 700 | -0.6 | Screen titles |
| `h1` | 22 / 28 | 700 | -0.3 | Section titles |
| `h2` | 18 / 24 | 600 | -0.2 | Card titles |
| `h3` | 16 / 22 | 600 | -0.1 | List item titles |
| `bodyLg` | 16 / 24 | 400 | 0 | Lead paragraph |
| `body` | 14 / 20 | 400 | 0 | Body |
| `bodyMedium` | 14 / 20 | 500 | 0 | Body (slightly weighted) |
| `bodyBold` | 14 / 20 | 600 | 0 | Inline emphasis |
| `caption` | 12 / 16 | 500 | 0 | Captions, meta |
| `micro` | 10 / 12 | 600 | 1.2 | Uppercase eyebrows, badges |

**Numerics:** Always use `numeric` (light, large) for hero stats. Tabular alignment in lists.

---

## Spacing

**File:** `src/theme/tokens.ts` — exported as `S`.

| Token | Px | Use |
|---|---|---|
| `S.xxs` | 2 | Hairline gaps |
| `S.xs` | 4 | Within a token (icon ↔ label) |
| `S.sm` | 8 | Tight gaps |
| `S.md` | 12 | Default gap between siblings |
| `S.lg` | 16 | Card padding, screen padding |
| `S.xl` | 20 | Section break |
| `S.xxl` | 24 | Major section break |
| `S.xxxl` | 32 | Hero spacing |
| `S.huge` | 48 | Onboarding |
| `S.mega` | 64 | Page-bottom safe spacing |

## Radius

**Exported as** `R`.

| Token | Px |
|---|---|
| `R.xs` | 4 |
| `R.sm` | 8 |
| `R.md` | 12 |
| `R.lg` | 16 |
| `R.xl` | 22 |
| `R.xxl` | 28 |
| `R.pill` | 999 |

---

## Layout tokens

**Exported from** `tokens.ts`.

| Token | Value | Use |
|---|---|---|
| `TAB_BAR_CLEARANCE` | `110` | Bottom padding reserved by `Screen` / `ScreenScroll` so the floating tab bar doesn't cover content. Sum of bar paddingTop (30) + BAR_HEIGHT (64) + paddingBottom (8) + slack. |

---

## Motion

**Exported as** `Motion`.

| Duration token | ms | Use |
|---|---|---|
| `instant` | 120 | Hover/press feedback |
| `fast` | 200 | Tab swap, simple toggles |
| `base` | 280 | Default reveal |
| `slow` | 420 | Hero entrance |
| `storyteller` | 640 | Storytelling reveal |

| Spring | Use |
|---|---|
| `soft` | Quiet ambient motion |
| `snappy` | Tap response |
| `bouncy` | Surprise reveals, playful |

**Rules:**
- Motion supports meaning. Pulses signal "live." Stagger signals "this is fresh." Bar blur signals "more content below."
- No animation longer than `storyteller`. If it feels long, it is.
- All animations driven through Reanimated worklets — never `Animated` API.
- Respect `AccessibilityInfo.reduceMotionEnabled` in v2.

### Scroll-aware chrome

The `TabBar` reads from `ScrollContext` and interpolates its tint overlay opacity between `1` (opaque) at `scrollY=0` and `0.55` (frosted) at `scrollY≥40`. This is the YouTube / Telegram pattern — bar is solid at rest, becomes a frosted-glass overlay as content scrolls under it. On screen focus change, `ScreenScroll` resets scrollY to 0 so each fresh tab starts with the bar opaque.

### Theme & language switches

Theme and language changes snap. This is the React Native standard practice (Linear, Spotify, Apple Music). RN has no equivalent of Flutter's `themeAnimationDuration` — implementing one requires animating every color via `interpolateColor`, a global refactor not worth the polish gain. An earlier "crossfade overlay" experiment was removed because it felt like a curtain rather than a smooth transition.

---

## Components

| Component | File | Purpose |
|---|---|---|
| `Text` | `src/components/ui/Text.tsx` | All text. Accepts `variant`, `tone`. |
| `Card` | `src/components/ui/Card.tsx` | Containers. Variants: `flat`, `elevated`, `sunken`, `outline`. |
| `Tap` | `src/components/ui/Tap.tsx` | Pressable with spring scale + haptic. Use for every interactive surface. |
| `Stack` | `src/components/ui/Stack.tsx` | Flex layout helper. |
| `Badge` | `src/components/ui/Badge.tsx` | Pill labels. Toned. |
| `Screen` / `ScreenScroll` | `src/components/ui/Screen.tsx` | Safe-area + bg-color + tab-bar-clearance screen frame. `ScreenScroll` writes scroll position to `ScrollContext`. |
| `BottomSheet` | `src/components/ui/BottomSheet.tsx` | Modal-backed bottom sheet with backdrop fade and spring slide-up. Used for preference pickers in About. |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | Shimmer-opacity placeholder for loading data. Reanimated `withRepeat` opacity loop. Used in tiles + dataset detail hero. |
| `ScreenEnter` | `src/components/system/ScreenEnter.tsx` | First-mount entrance helper. Variants `fade`, `fadeUp`. |
| `TabBar` | `src/components/nav/TabBar.tsx` | Floating blurred bottom tab bar with center AI FAB. |
| `ScrollProvider` / `useScrollY` | `src/components/system/ScrollContext.tsx` | Shared scroll position for chrome animations. |

**Convention:** Never use raw `<TouchableOpacity>` or `<Pressable>` for primary interactions — they don't give haptics or scale. Use `Tap`.

**Convention:** Use `ScreenScroll` (not raw `ScrollView`) for scrollable tab content — it handles safe-area, tab-bar clearance, status-bar style, and the scroll-position wiring automatically.
