# Contributing

GovExplorer is a small project with high design standards. Conventions exist to keep the codebase predictable so contributors can focus on craft.

---

## Workflow

1. Branch from `main`: `feature/<scope>`, `fix/<scope>`, `chore/<scope>`.
2. Make the change. Keep PRs small — one feature, one fix, one refactor per PR.
3. Open the PR with a body that answers: *what changed, why, and how to verify*.
4. Self-review the diff before requesting review.

---

## Commit messages

Conventional commits with a short type prefix:

```
feat(today): add streak chip animation
fix(api): handle empty exchangerates response
chore(theme): tighten typography tracking
refactor(insights): split fuel price screen into hero + chart
docs(api): document GTFS-RT plans
```

Stay under 72 characters in the subject. Body optional but encouraged for non-trivial changes.

---

## Code style

- **TypeScript strict.** Don't disable. Don't `any`. If you reach for it, ask first.
- **Path alias.** `@/foo` over `../../foo`.
- **Named exports** for components and hooks. Default exports only at file-based-route entry points (Expo Router requires them).
- **Hooks at top.** No conditionally-mounted hooks.
- **No new global state libraries.** Context + TanStack Query cover everything currently planned.
- **No prop drilling deeper than 2 levels.** Lift to a Context or feature-scoped hook.

---

## Components

- Reach for `Text` / `Tap` / `Card` / `Stack` / `Badge` before raw RN primitives.
- Theme colors come from `useTheme()`. Never import from `palette` directly outside of `src/theme/`.
- Animations: Reanimated worklets only. Never the legacy `Animated` API.
- Haptics: every primary interaction should pass through `Tap` so feedback is consistent.

---

## i18n

- Every user-facing string lives in `src/i18n/en.ts` and `src/i18n/ms.ts`.
- Add to `en.ts` first; TypeScript will tell you what's missing in `ms.ts` (`Strings` type).
- No string interpolation libraries — template strings against the dictionary value are fine.

---

## Data

- New dataset? Add it to [DATA_SOURCES.md](DATA_SOURCES.md), then write the query hook under `src/features/<feature>/api/`.
- Always parse to a view shape in `select` so components don't deal with raw API responses.
- Surface attribution (agency + `asOf` date) wherever the data is rendered.

---

## What not to add

- A backend.
- Auth / accounts.
- Analytics SDKs (in v1).
- Third-party data sources (Firebase, Aqicn, OpenWeather, etc.) — `data.gov.my` only.
- Generic catalogue browsers / "all 397 datasets" pages — the curation is the product.
- Ad-hoc inline styles outside of token-driven values from `S` / `R` / `theme`.

---

## Reviewing

Reviewers should check:

- Does this match the editorial + civic-tech voice, or does it feel like a generic dashboard?
- Are tokens (`S`, `R`, `theme`, `type`) used, or are magic numbers leaking in?
- Is data attributed?
- Does motion serve meaning, or is it animation for its own sake?
- Does dark mode look as deliberate as light mode (or vice versa)?
