# Setup

Get GovExplorer running locally in ~5 minutes.

---

## Prerequisites

- **Node.js** 20+ (use `nvm` / `fnm` / `volta` — pin via `.nvmrc` recommended)
- **npm** 10+ (or `pnpm` / `bun` — repo uses npm)
- **Expo Go** app on a physical device, *or*:
  - **iOS Simulator** (Xcode 15+, macOS only)
  - **Android Emulator** (Android Studio with an AVD configured)

No native build chain is required for the managed Expo flow.

---

## Install

```bash
git clone <repo>
cd GovExplorer
npm install
```

---

## Run

```bash
npm run start
```

This boots Metro and prints a QR code.

- Press `i` → open iOS simulator
- Press `a` → open Android emulator
- Scan the QR with Expo Go on a real device

Or target a platform directly:

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # browser
```

---

## Project conventions

- **TypeScript strict** is on. Don't disable.
- **Path alias** `@/*` → `src/*`. Use it instead of relative climbs (`../../../`).
- **No linter / formatter** is configured yet. Match the existing style.
- **No git hooks**.

---

## Troubleshooting

**Metro complains about a missing module after pulling.**
Re-install — `rm -rf node_modules && npm install`.

**Fonts don't load on first launch.**
`SplashScreen.preventAutoHideAsync` gates render on font load. If you see a blank white screen for > 3s, kill and relaunch.

**Reanimated warnings about "Reading from `value` during component render".**
Don't mutate shared values during render. Do it inside `useEffect` or event handlers. See `src/components/nav/TabBar.tsx` for the pattern.

**Expo Go shows old build.**
Force-quit Expo Go, then re-scan.

---

## Building

Native binaries are not part of v1. When the time comes:

```bash
npx expo prebuild           # generate ios/ and android/
eas build --platform ios    # cloud build via EAS
```

EAS configuration lives in `eas.json` (not yet checked in).
