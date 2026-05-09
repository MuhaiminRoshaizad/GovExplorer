# GovExplorer

> A React Native playground for exploring Malaysia's open data APIs.

Built with **React Native (Expo) + TypeScript**, GovExplorer is my first React Native app — a hands-on project to learn the framework while playing with the public datasets from [data.gov.my](https://data.gov.my/) and [developer.data.gov.my](https://developer.data.gov.my/).

> 🇲🇾 Coming from Flutter, treating this as a sandbox to figure out what the gov APIs expose and what kinds of screens make sense to build around them.

---

## 📸 Screenshots

_Coming soon — once the first screens are built._

---

## ✨ Features

**v1 (in progress)** — see [docs/design.md](./docs/design.md) for the full spec.

| Feature | Source API | Cadence |
|---|---|---|
| 🌤️ **Weather forecast** | METMalaysia | Daily, scoped to user's state |
| 🌫️ **Air quality (AQI)** | DOE | Hourly, nearest station |
| 💱 **Exchange rates** | Bank Negara Malaysia | Daily (business days) |
| 💧 **Dam water levels** | JPS via data.gov.my | Daily |
| ⛽ **Fuel prices** | Data Catalogue (`fuelprice`) | Weekly |
| 📈 **Economic indicators** | DOSM | Monthly — CPI, unemployment |
| 👥 **Demographics** | DOSM, JPN, JPJ | Births, vehicle registrations, population by state |
| 📊 **Curated catalogue** | Data Catalogue | Search, filter, favourite |

**Deferred to v2:**

- 🚆 Public transport (GTFS-Realtime — KTM, Rapid KL)
- ⚠️ Weather & earthquake warnings
- ✨ AI-assisted dataset search

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Expo](https://expo.dev/) (React Native managed workflow) |
| Language | TypeScript |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Server state | [TanStack Query](https://tanstack.com/query) |
| Charts | [Victory Native](https://commerce.nearform.com/open-source/victory-native) (Skia) |
| Storage | [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) |
| Icons | [`lucide-react-native`](https://lucide.dev/) |
| Data sources | [data.gov.my](https://developer.data.gov.my/), [api.bnm.gov.my](https://api.bnm.gov.my/), [api.met.gov.my](https://api.met.gov.my/) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** LTS (22.x recommended) — [nodejs.org](https://nodejs.org/)
- **Expo Go** app on your phone — [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)
- _(optional)_ Android Studio if you want to run on an emulator instead of a physical device

### Installation

```bash
git clone https://github.com/MuhaiminRoshaizad/GovExplorer.git
cd GovExplorer
npm install
```

### Running the app

```bash
npx expo start
```

Then either:

- **On phone** — open Expo Go and scan the QR code printed in the terminal (phone and PC must be on the same Wi-Fi)
- **Android emulator** — press `a` in the terminal
- **Web** — press `w` in the terminal

Edit `App.tsx` and save — the app reloads instantly via Fast Refresh.

---

## 📁 Project Structure

```
GovExplorer/
├── app/                          # expo-router routes
│   ├── _layout.tsx               # root: providers (Query, Theme, I18n, SafeArea)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # tab bar (Home only in v1)
│   │   └── index.tsx             # Home screen
│   └── dataset/[id].tsx          # dataset detail (currently fuel only)
├── src/
│   ├── api/
│   │   ├── client.ts             # apiGet with named base URLs
│   │   └── datasets/
│   │       └── fuelPrice.ts      # useFuelPriceQuery hook
│   ├── components/
│   │   ├── ui/                   # Card, Chip, SectionHead, StatCard, Skeleton, DataView
│   │   └── feature/              # FuelLevelRow, FuelHistoryRow
│   ├── theme/                    # tokens (light + dark), ThemeProvider, fonts
│   ├── i18n/                     # BM/EN dictionaries + provider
│   ├── hooks/                    # useSetting (AsyncStorage)
│   └── types/
│       └── fuelPrice.ts
├── assets/                       # icons, splash
├── docs/
│   ├── design.md                 # v1 spec
│   └── plans/
│       └── 01-foundation.md      # this plan
├── app.json                      # Expo config
├── package.json
└── tsconfig.json
```

---

## 📚 Data Sources

Primary source is the Malaysian Government Open Data portal, with two complementary public APIs for daily-frequency data:

| Source | Base URL | Used for |
|---|---|---|
| data.gov.my | `https://api.data.gov.my` | Catalogue datasets (fuel, CPI, population, AQI, dams, etc.) |
| Bank Negara Malaysia | `https://api.bnm.gov.my/public` | Exchange rates |
| METMalaysia | `https://api.met.gov.my/v2.1` | Weather forecasts |

- **Browse datasets** → [data.gov.my/data-catalogue](https://data.gov.my/data-catalogue)
- **API docs** → [developer.data.gov.my](https://developer.data.gov.my/)

---

## 📝 License

MIT License — Copyright (c) 2026 Muhammad Muhaimin Bin Roshaizad. See [LICENSE](./LICENSE) for the full text.

---

## 👤 Author

**Muhammad Muhaimin Bin Roshaizad** — [@MuhaiminRoshaizad](https://github.com/MuhaiminRoshaizad) (`minned`)

Built as a personal learning project. Feedback and suggestions welcome.
