# GovExplorer Docs

Welcome. These docs cover everything from local setup to design tokens to the v2 roadmap.

## Read these first

1. [SETUP.md](SETUP.md) — Get the app running locally in ~5 minutes
2. [ARCHITECTURE.md](ARCHITECTURE.md) — Understand the app's bones
3. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual language and tokens

## Reference

- [FEATURES.md](FEATURES.md) — What ships, screen-by-screen
- [API.md](API.md) — How we talk to `api.data.gov.my`
- [DATA_SOURCES.md](DATA_SOURCES.md) — The curated dataset catalogue
- [ROADMAP.md](ROADMAP.md) — What's planned
- [CONTRIBUTING.md](CONTRIBUTING.md) — Conventions and PR flow

## Principles

- **Editorial over dashboard.** Charts and copy that feel hand-crafted, not generated.
- **Native frequency, honest cadence.** A dataset that publishes monthly is shown monthly. Nothing fake-daily.
- **No login, ever.** All state in `AsyncStorage`. Single-device, private by default.
- **Single-source.** Only `data.gov.my`. No third-party data shims.
- **Boring stack, exciting craft.** Expo + Reanimated + TanStack Query are unflashy on purpose; the craft is in the details.
