# GovExplorer

> A React Native playground for exploring Malaysia's open data APIs.

Built with **React Native (Expo) + TypeScript**, GovExplorer is my first React Native app — a hands-on project to learn the framework while playing with the public datasets from [data.gov.my](https://data.gov.my/) and [developer.data.gov.my](https://developer.data.gov.my/).

> 🇲🇾 Coming from Flutter, treating this as a sandbox to figure out what the gov APIs expose and what kinds of screens make sense to build around them.

---

## 📸 Screenshots

_Coming soon — once the first screens are built._

---

## ✨ Planned Features

Still scoping based on what the API actually exposes. Strong candidates:

| Feature | Source API | Why |
|---|---|---|
| 🌤️ **Weather Forecast** | Realtime / Weather | 7-day forecasts (morning, afternoon, night) per location |
| ⚠️ **Weather & Earthquake Warnings** | Realtime / Weather | Live alerts in EN + BM |
| ⛽ **Fuel Price Tracker** | Data Catalogue (`fuelprice`) | Weekly diesel / RON95 / RON97 trends |
| 🚆 **Public Transport** | Realtime / Transport (GTFS-R) | KTM, Rapid KL, etc. live feed |
| 📈 **Economic Dashboard** | OpenDOSM | CPI, GDP, unemployment indicators |
| 📊 **Data Catalogue Browser** | Data Catalogue | Search & preview any government dataset |

The exact lineup will firm up as I explore each endpoint.

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Expo](https://expo.dev/) (React Native managed workflow) |
| Language | TypeScript |
| Navigation | _TBD_ (likely Expo Router) |
| State | _TBD_ |
| Data Source | [data.gov.my](https://developer.data.gov.my/) REST API |

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
├── assets/             # Images, icons, fonts
├── App.tsx             # Root component (entry UI)
├── index.ts            # Registers App with React Native
├── app.json            # Expo config (name, icon, splash, permissions)
├── package.json        # Dependencies & npm scripts
├── tsconfig.json       # TypeScript compiler config
└── .gitignore
```

---

## 📚 Data Source

All data comes from the Malaysian Government Open Data portal:

- **Browse datasets** → [data.gov.my/data-catalogue](https://data.gov.my/data-catalogue)
- **API docs** → [developer.data.gov.my](https://developer.data.gov.my/)
- **Base URL** → `https://api.data.gov.my`

Endpoints used (so far):

| Endpoint | Purpose |
|---|---|
| `GET /data-catalogue?id=<dataset_id>` | Static datasets (e.g. `fuelprice`) |
| `GET /weather/forecast` | 7-day weather forecasts |
| `GET /weather/warning` | Active weather warnings |
| `GET /weather/warning/earthquake` | Earthquake alerts |

---

## 📝 License

MIT — see [LICENSE](./LICENSE).

---

## 👤 Author

**Muhaimin Roshaizad** — [@MuhaiminRoshaizad](https://github.com/MuhaiminRoshaizad) (`minned`)

Built as a personal learning project. Feedback and suggestions welcome.
