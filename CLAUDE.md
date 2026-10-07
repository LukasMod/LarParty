# LarParty

## Repository Overview

### Technology Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Routing**: Expo Router
- **Styling**: Unistyles
- **State & Persistence**: Zustand persisted to MMKV
- **i18n**: i18next + react-i18next (English + Polish)
- **AI**: `@google/genai` (Gemini) called directly from the client
- **Platforms**: iOS and Android first, web second
- **React Compiler**: enabled; prefer plain derived values in render and avoid `useMemo`/`useCallback` unless there is a proven need outside compiler optimization

## Product Context

- LarParty is a proof-of-concept app for LARP and themed-party users.
- Core flow: party list → create party → party details → create card → card details.
- The app generates AI-powered character cards from lightweight form input.
- Saved parties and cards must remain browsable offline (local persistence only).
- No local LLM: generation/regeneration always call the remote Gemini provider and require internet. Offline browsing works; creating new cards does not.
- MVP is local-only: no auth, no backend, no notifications, no payments.

## Core Architecture & Structure

### Routing

- Navigation is a single stack in `src/app/_layout.tsx`.
- Main routes live under `src/app`:
  - `/` — party list
  - `/party/new` — create party
  - `/party/[partyId]` — party details
  - `/party/[partyId]/card/new` — create character card
  - `/party/[partyId]/card/[cardId]` — card details
  - `/settings` — language preference

### Feature Modules

Domain code lives in `src/features`:

- `parties` — types, selectors, persisted store logic
- `cards` — types, selectors, persisted store logic
- `preferences` — persisted UI preferences
- `generation` — Gemini client, prompt builder, schemas, generation types

### Shared Infrastructure

Shared code lives in `src/shared`:

- `components/screen.tsx` — safe-area + scroll wrapper
- `constants/party-options.ts` — source of truth for reusable enums and labels
- `i18n/*` — i18next instance, en/pl locale objects, translated enum labels
- `storage/*` — Zustand ↔ MMKV adapter
- `theme/*` — app theming foundation

## Key Domain Rules

- Stores use `hasHydrated` to distinguish empty state from restore-in-progress.
- Deleting a party must also delete all cards for that party.
- New generations save as `draft`; accept flips status to `accepted`.
- Regenerate creates a new draft and preserves history with `basedOnCardId` and `generationGroupId`.
- If generated card shape changes, update both `src/features/generation/schemas.ts` and the card types.
- Theme/mood/trait/sex/display-mode options should stay aligned with `docs/mvp-decisions.md` and `src/shared/constants/party-options.ts`.
- Every user-facing string goes through `useTranslation`. Add keys to **both** `src/shared/i18n/locales/en.ts` and `pl.ts`; a missing Polish key silently falls back to English.
- Generated card text follows the resolved app language; JSON schema keys stay English.

## Environment & Runtime Notes

- Character generation requires `EXPO_PUBLIC_GEMINI_API_KEY` in `src/features/generation/gemini.ts`.
- Dev builds have a **Debug fixtures** section on the Settings screen (`src/shared/debug/`) that seeds the stores with fake parties and cards, or clears them, with no API calls. Use it to test list/details/cascade-delete flows without spending generation requests. Details in [architecture.md](./docs/architecture.md#dev-only-debug-fixtures).
- AI generation is a direct client-side integration for the PoC.
- State is local-only; there is no backend sync.
- Mobile is the priority target. Do not let web parity slow down the MVP.

## Development Workflow

### Common Commands

- `npm install`
- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run lint`
- `npm run typecheck`
- `npm run check` — run lint + typecheck + contrast
- `npm run format` — Prettier (no semicolons, single quotes)
- `npx expo start --clear` — clear Metro cache

### Testing

- No test runner is configured. No single-test command exists.
- **`npm run typecheck` fails on a clean checkout** with 15 i18n typing errors. Lint
  passes. Do not assume you caused them, and do not "fix" it by deleting
  `src/shared/i18n/i18next.d.ts` or loosening `tsconfig`. Root cause and a verified
  2-file fix are in
  [docs/architecture.md](./docs/architecture.md#npm-run-typecheck-fails-on-a-clean-checkout).

## Documentation Resources

Start with [docs/README.md](./docs/README.md) for what each doc is for.

### Docs policy — mandatory

- **Docs describe the present, always.** Every live doc states how things work _now_, in
  present tense. No "previously / originally / used to / no longer / still", no before-and-after
  comparisons, no "reduced from X to Y", no drift tables, no notes about what a section used to
  say.
- **Update in place, in the same change as the code.** When behavior, enums, routes, or rules
  change, rewrite the affected doc to the new truth. Do not annotate the old text, do not keep a
  record of it, do not add a banner explaining the change.
- **Resolved items get deleted, not marked resolved.** A fixed bug, completed task, answered
  question, or superseded decision is removed from the doc entirely. Open issues stay, described
  in present tense ("this throws when…", not "this regressed when…").
- **History lives only in git.** If old reasoning matters, either keep it as present-tense
  rationale ("grouping by `generationGroupId` avoids a versioning engine") or let `git log` hold
  it. Never mix the two in one file.
- **Code beats prose.** If a doc disagrees with the code, fix the doc immediately.

### Current docs

- [Architecture](./docs/architecture.md) — how the code works: layout, screen-model pattern, stores, generation flow, current hazards
- [Product spec](./docs/product-spec.md) — product scope, user flows, screen purposes, AI output contract, offline rules
- [MVP decisions](./docs/mvp-decisions.md) — current domain rules, enums, lifecycle, platform priorities
- [i18n guide](./docs/i18n-guide.md) — namespaces, adding strings, adding a locale, localizing AI output
- [Theming guide](./docs/theming-guide.md) — theme architecture, theme override usage, Unistyles conventions
- [Roadmap](./docs/roadmap.md) — remaining work and explicit non-goals
- [Discovery questions](./docs/discovery-questions.md) — currently open product and UX questions
- [Agent Device smoke tests](./docs/agent-device-smoke-tests.md) — iOS simulator runbook and screen-by-screen QA checks

## Repo Hazards

Read [docs/architecture.md → Dead code and hazards](./docs/architecture.md#dead-code-and-hazards)
before deleting or imitating anything. In short:

- `src/components/` and `src/hooks/` hold Expo starter leftovers. Only `themed-text.tsx`,
  `themed-view.tsx`, and `use-theme.ts` are live — they are imported across the app.
- `src/app/explore.tsx` is an orphaned route whose copy describes features the app lacks.
- `CardDisplayModeSwitch` is orphaned, so the persisted `cardDisplayMode` preference has
  no effect. Tracked in discovery questions.

`README.md` is the default Expo template and tells readers to run `npm run reset-project`,
which removes the app.
