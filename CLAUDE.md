# LarParty

## Repository Overview

### Technology Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Routing**: Expo Router
- **Styling**: Unistyles
- **State & Persistence**: Zustand persisted to MMKV
- **Platforms**: iOS and Android first, web second
- **React Compiler**: enabled; prefer plain derived values in render and avoid `useMemo`/`useCallback` unless there is a proven need outside compiler optimization

## Product Context

- LarParty is a proof-of-concept app for LARP and themed-party users.
- Core flow: party list → create party → party details → create card → card details.
- The app generates AI-powered character cards from lightweight form input.
- Saved parties and cards must remain browsable offline.
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
- `storage/*` — Zustand ↔ MMKV adapter
- `theme/*` — app theming foundation

## Key Domain Rules

- Stores use `hasHydrated` to distinguish empty state from restore-in-progress.
- Deleting a party must also delete all cards for that party.
- New generations save as `draft`; accept flips status to `accepted`.
- Regenerate creates a new draft and preserves history with `basedOnCardId` and `generationGroupId`.
- If generated card shape changes, update both `src/features/generation/schemas.ts` and the card types.
- Theme/mood/trait/sex/display-mode options should stay aligned with `docs/mvp-decisions.md` and `src/shared/constants/party-options.ts`.

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
- `npx expo start --clear` — clear Metro cache

### Testing

- No test runner is configured yet.
- No single-test command exists yet.

## Documentation Resources

Use the docs for deeper product and architecture context:

- [Product spec](./docs/product-spec.md) — product scope, user flows, screen purposes, AI output contract, offline rules
- [MVP decisions](./docs/mvp-decisions.md) — frozen MVP rules, enums, lifecycle rules, platform priorities, display-mode behavior
- [Implementation plan](./docs/implementation-plan.md) — architecture rationale, route plan, domain model, persistence strategy, generation flow
- [Build checklist](./docs/build-checklist.md) — execution checklist by phase
- [Discovery questions](./docs/discovery-questions.md) — unresolved product and UX questions before scope changes
- [Phase 1 tasks](./docs/phase-1-tasks.md) — early shell-migration plan explaining route/layout direction
- [Agent Device smoke tests](./docs/agent-device-smoke-tests.md) — practical iOS simulator runbook and screen-by-screen QA checks for AI-driven app verification

[README](./README.md) is still mostly the default Expo template.
