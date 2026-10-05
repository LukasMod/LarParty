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
- `npm run check` — run lint + typecheck
- `npm run format` — Prettier (no semicolons, single quotes)
- `npx expo start --clear` — clear Metro cache

### Testing

- No test runner is configured yet.
- No single-test command exists yet.
- **`npm run typecheck` fails on a clean checkout** with 15 pre-existing i18n typing
  errors. Lint passes. Do not assume you caused them, and do not "fix" it by deleting
  `src/shared/i18n/i18next.d.ts` or loosening `tsconfig`. Root cause and a verified
  partial fix are in
  [docs/architecture.md](./docs/architecture.md#npm-run-typecheck-fails-on-a-clean-checkout).

## Documentation Resources

Start with [docs/README.md](./docs/README.md) for what each doc is for and how far to
trust it.

- [Architecture](./docs/architecture.md) — **how the code is today**: layout, screen-model pattern, stores, generation flow, known dead code
- [Product spec](./docs/product-spec.md) — product scope, user flows, screen purposes, AI output contract, offline rules
- [MVP decisions](./docs/mvp-decisions.md) — frozen MVP rules, enums, lifecycle rules, platform priorities, display-mode behavior
- [i18n guide](./docs/i18n-guide.md) — namespaces, adding strings, adding a locale, localizing AI output
- [Theming guide](./docs/theming-guide.md) — app theme architecture, theme override usage, and Unistyles styling conventions
- [Implementation plan](./docs/implementation-plan.md) — **Current Status** at the top is the live forward plan (remaining work). Below it is the original architecture rationale, with a drift table.
- [Discovery questions](./docs/discovery-questions.md) — unresolved product and UX questions before scope changes
- [Agent Device smoke tests](./docs/agent-device-smoke-tests.md) — practical iOS simulator runbook and screen-by-screen QA checks for AI-driven app verification
- [Archive](./docs/archive/) — completed/stale planning docs. Do not implement from these

## Repo Hazards

Read [docs/architecture.md → Dead code and hazards](./docs/architecture.md#dead-code-and-hazards)
before deleting or imitating anything. In short:

- `src/components/` and `src/hooks/` hold Expo starter leftovers. Only `themed-text.tsx`,
  `themed-view.tsx`, and `use-theme.ts` are live — they are imported across the app.
- `src/app/explore.tsx` is an orphaned route with outdated copy.
- `CardDisplayModeSwitch` is orphaned, so the persisted `cardDisplayMode` preference has
  no effect. Known regression, tracked in discovery questions.

[README](./README.md) is still mostly the default Expo template.
