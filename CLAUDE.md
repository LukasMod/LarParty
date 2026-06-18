# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`
- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run lint`
- `npx expo start --clear` — clear Metro cache

## Testing

- No test runner configured yet.
- No single-test command yet.

## Runtime notes

- Character generation requires `EXPO_PUBLIC_GEMINI_API_KEY` in `src/features/generation/gemini.ts`.
- State is local-only: Zustand persisted to MMKV. No backend.
- Expo Router uses `expo-router/entry`, with routes in `src/app`.
- TS aliases: `@/* -> src/*`, `@/assets/* -> assets/*`.

## Architecture

- App flow: party list → new party → party details → new card → card details.
- Navigation is single stack in `src/app/_layout.tsx`.
- Domain code lives in `src/features`:
  - `parties`: types, selectors, persisted store
  - `cards`: types, selectors, persisted store
  - `preferences`: persisted UI prefs
  - `generation`: Gemini client, prompt builder, schemas
- Shared code lives in `src/shared`:
  - `components/screen.tsx`: safe-area + scroll wrapper
  - `constants/party-options.ts`: source of option enums/labels reused by UI, types, prompts
  - `storage/*`: Zustand ↔ MMKV adapter

## Important behavior

- Stores use `hasHydrated` to distinguish empty state from restore-in-progress.
- Deleting party also deletes all cards for that party.
- New generations save as `draft`; accept flips status to `accepted`.
- Regenerate creates new draft, keeps history via `basedOnCardId` and `generationGroupId`.
- If generated card shape changes, update both `src/features/generation/schemas.ts` and card types.

## Docs

Use docs for deeper product and architecture context:

- [Product spec](./docs/product-spec.md) — product scope, user flows, screen purposes, AI output contract, offline rules
- [MVP decisions](./docs/mvp-decisions.md) — frozen MVP rules, enums, lifecycle rules, platform priorities, display-mode behavior
- [Implementation plan](./docs/implementation-plan.md) — architecture rationale, route plan, domain model, persistence strategy, generation flow, phased build order
- [Build checklist](./docs/build-checklist.md) — execution checklist by phase
- [Discovery questions](./docs/discovery-questions.md) — unresolved product and UX questions before scope changes
- [Phase 1 tasks](./docs/phase-1-tasks.md) — early shell-migration plan explaining current route/layout direction

[README](./README.md) mostly default Expo template.