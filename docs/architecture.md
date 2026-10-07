# Architecture

How the code works. Where this and the code disagree, the code wins — fix this file.

Small codebase: ~80 TypeScript files, ~4.3k lines, 72 of them under 100 lines. Reading the
real file is often faster than reading prose.

## Stack

| Concern             | Choice                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| Runtime             | Expo SDK 57, React Native 0.86.3, React 19.2.3, New Architecture on            |
| Routing             | Expo Router, typed routes on                                                   |
| Styling             | react-native-unistyles v3 (babel plugin scoped to `src`)                       |
| State + persistence | Zustand v5 + `persist` → MMKV (`react-native-mmkv` v4, Nitro)                  |
| Validation          | Zod v4 (AI response only)                                                      |
| i18n                | i18next + react-i18next, en + pl                                               |
| AI                  | `@google/genai`, `gemini-3.5-flash-lite`                                       |
| Compiler            | React Compiler enabled; forms still use `useState`, and some `useMemo` remains |

Path alias `@/*` → `src/*`, plus `@/assets/*`. Precedent for `@/assets` is in
`src/components/app-tabs.tsx`.

## Layout

```text
src/
  app/                      routes only; thin, no business logic
  components/               EXPO STARTER LEFTOVERS — see "Dead code"
  constants/theme.ts        compatibility re-export of appThemes
  features/
    parties/  cards/        types.ts, selectors.ts, store/, hooks/, components/
    preferences/store/      display mode + language preference
    generation/             gemini.ts, prompt.ts, schemas.ts, types.ts (flat)
  hooks/                    starter hooks; only use-theme.ts is live
  shared/
    components/ constants/ i18n/ storage/ theme/ utils/
```

Feature module convention (`parties`, `cards`):

| Dir/file                                       | Contract                                                                                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                                     | Domain interfaces + types derived from `shared/constants` enums                                                                                           |
| `selectors.ts`                                 | Pure functions over arrays. No store access                                                                                                               |
| `store/<name>-store.ts`                        | Zustand + persist. Owns all writes                                                                                                                        |
| `hooks/use-*-screen-model.ts`                  | Read side. Returns a discriminated `status` union                                                                                                         |
| `hooks/use-*-actions.ts` / `use-new-*-form.ts` | Write side. Validation, alerts, navigation                                                                                                                |
| `components/`                                  | Presentational. Props in, no store reads. The single exception is the orphaned `card-display-mode-switch.tsx`, which reads the preferences store directly |

## Routes

`src/app/_layout.tsx` declares one stack and translates every title with `t('screens.*')`.
`/`, `/party/[partyId]` and `/party/[partyId]/card/[cardId]` set `headerShown: false` and draw
their own header with `ScreenHeader` (`src/shared/components/screen-header.tsx`): the home screen
shows the serif `LarParty` wordmark with separate circular icon buttons for create-party `+` (only
when parties exist) and settings; party details and card details show a circular back button beside
their serif title, and party details adds a circular `+` that opens the new-card form. `IconButton`
renders those circular buttons.

| Route                            | File                                          |
| -------------------------------- | --------------------------------------------- |
| `/`                              | `index.tsx` — party list                      |
| `/party/new`                     | `party/new.tsx`                               |
| `/party/[partyId]`               | `party/[partyId].tsx`                         |
| `/party/[partyId]/card/new`      | `party/[partyId]/card/new.tsx`                |
| `/party/[partyId]/card/[cardId]` | `party/[partyId]/card/[cardId].tsx`           |
| `/settings`                      | `settings.tsx`                                |
| `/explore`                       | `explore.tsx` — **orphaned**, see "Dead code" |

Params come from `useLocalSearchParams<{ partyId: string }>()`. Navigation uses
`router.replace(...)` after every create/delete so back does not return to a stale screen.

## Screen model pattern

Screens do not read stores directly and do not branch on hydration inline. They call a
screen-model hook returning a union:

```ts
type CardDetailsScreenModel =
  | { status: 'loading'; party: null; card: null }
  | { status: 'missing'; party: null; card: null }
  | { status: 'ready'; party: Party; card: CharacterCard }
```

`loading` means a store has not hydrated. `missing` covers not-found **and** mismatch —
card details also checks `card.partyId !== partyId`, so a card cannot be opened under the
wrong party route. Each branch renders `ScreenStateCard`.

The model hooks subscribe with inline selectors, e.g.
`usePartyStore((state) => getPartyById(state.parties, partyId))`. Keep that shape: it
limits re-renders to the entity that changed.

Not every route follows this. The two create routes (`/party/new`, `/party/[partyId]/card/new`)
read stores without a hydration gate. `card/new.tsx` resolves the party with
`getPartyById` and renders "Party not found" when it is `null` — so a cold deep link into
that route can flash the not-found state before hydration completes. Copy the
screen-model union when fixing it; do not copy the current shape.

## Stores

Three persisted stores, all `zustand/persist` over `createJSONStorage(() => zustandStorage)`
with a distinct `name` (`party-store`, `card-store`, `preferences-store`).

| Store                 | State                                                  | Actions                                                              |
| --------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `usePartyStore`       | `parties`, `hasHydrated`                               | `createParty`, `deleteParty`                                         |
| `useCardStore`        | `cards`, `hasHydrated`                                 | `createDraftCard`, `acceptCard`, `deleteCard`, `deleteCardsForParty` |
| `usePreferencesStore` | `cardDisplayMode`, `languagePreference`, `hasHydrated` | setters                                                              |

Load-bearing details:

- **`hasHydrated`** is set in `onRehydrateStorage`. It is what separates "empty" from
  "still restoring". Never render an empty state without checking it.
- **Cross-store cascade**: `deleteParty` calls `useCardStore.getState().deleteCardsForParty(...)`
  directly. That is the only cross-store write. Keep it imperative — no event bus.
- **Newest-first**: every write prepends, so both lists show newest at top. The party list
  relies on that array order directly; card lists additionally re-sort by `updatedAt`.
- **IDs** come from `createId(prefix)` → `party-<uuid>`, `card-<uuid>`,
  `generation-<uuid>`. Prefixes are part of the id format.
- **Timestamps** are `new Date().toISOString()` strings, compared with
  `localeCompare`. Do not switch to `Date.parse` ordering without touching all sorts.
- **No store has schema versioning.** None of `party-store`, `card-store`, or
  `preferences-store` set a `version` or `migrate`. MMKV survives app rebuilds and persisted
  JSON bypasses the TypeScript types entirely — the compiler will not warn you when a stored
  shape drifts from the type.
- **Removing an enum value breaks existing local data.** `getPartyTheme` is a total map
  (`Record<ThemeCategory, AppTheme>`), so a saved party holding a value absent from the enum
  makes the lookup return `undefined` and `partyTheme.colors.accent` throws — a
  white screen on party and card details, not a graceful fallback. There is no migration layer.
  The MVP has no users, so the accepted handling is to clear local storage (or reinstall) after
  trimming an enum; a fresh install never holds a dropped value. If real installs ever hold
  data, add a `persist` `version` + `migrate` first.

## Domain rules worth knowing before editing

- A card belongs to exactly one party via `partyId`.
- Generation always saves a **draft**. `acceptCard` flips status; nothing else does.
- Regenerate creates a **new** card carrying `basedOnCardId` (previous card) and reusing
  `generationGroupId`. If `generationGroupId` is absent, `createDraftCard` mints one, so
  the first generation also establishes a group. Accepted versions are never overwritten.
  Grouping by `generationGroupId` is what keeps version history queryable without a separate
  versioning engine.
- `generated.characterTraits` is a 3-tuple in both the TS type and the Zod schema.
- Trait selection is capped at 3 (`MAX_TRAITS` in `use-new-character-card-form.ts`).
- Validation is hand-rolled in the form hooks. Zod guards **only** AI output. There is no
  `shared/validation/` directory.

## Generation flow

Generation is always remote. There is no offline or on-device path: `generateCharacterCard`
calls Gemini over the network, so creating/regenerating a card requires internet. Offline
only the read/browse flows work (see [`mvp-decisions.md`](./mvp-decisions.md)).

`prompt.ts` builds a text prompt; `gemini.ts` calls `generateContent` with
`responseMimeType: 'application/json'` and `generatedCharacterCardJsonSchema`, then
`generatedCharacterCardSchema.parse(...)` — so malformed or off-schema AI output throws
rather than saving bad data. Errors bubble to the form hook, which sets `errorMessage`
and saves nothing.

Two schemas must stay in lockstep with the domain type: the hand-written Gemini JSON
schema and the Zod schema, both in `schemas.ts`, plus `CharacterCardGenerated` in
`features/cards/types.ts`. Changing generated fields means editing all three.

The generator sits behind a `CharacterCardGenerator` interface, and
`getCharacterCardGenerator()` caches a singleton. That seam is the intended place for a
backend swap; the key is `EXPO_PUBLIC_GEMINI_API_KEY`, i.e. baked into the client bundle.
Fine for the PoC, not for release.

Output language follows the resolved app language. See [`i18n-guide.md`](./i18n-guide.md).

## Theming

Four themes in `src/shared/theme/unistyles.ts`: `default` (the app's active theme) plus one
per `themeCategory` — `fantasy`, `'sci-fi'`, `horror`. Registered via `StyleSheet.configure`
at import time from `index.ts`. `party-theme.ts` maps a category to a theme object; card
components take `partyThemeCategory` as a prop and call `getPartyTheme(...)` themselves.

Note the double meaning of "theme": the app's active theme is fixed to `default`
(`initialTheme`), and party themes are applied as **overrides**, not by switching the
Unistyles theme. Conventions live in [`theming-guide.md`](./theming-guide.md).

`src/constants/theme.ts` re-exports `appThemes` slices (`Colors`, `Fonts`, `Spacing`,
`Radius`) for non-Unistyles consumers. Prefer `StyleSheet.create((theme) => ...)` in new
code; that file exists mainly for the starter components.

## Dead code and hazards

Known and verified. Do not "discover" these again; do not imitate them either.

- **`src/components/`** — starter leftovers. Only `themed-text.tsx` and `themed-view.tsx`
  are live, and they are imported everywhere. `animated-icon*`, `app-tabs*`,
  `external-link`, `hint-row`, `web-badge`, `ui/collapsible`, and the `.module.css` are
  imported by nothing. **Do not delete `themed-text.tsx` / `themed-view.tsx`.**
- **`src/app/explore.tsx`** — reachable route, absent from the stack config, linked from
  nothing. Its copy advertises "local LLM generation", which the app does not have. It also
  uses plain RN `StyleSheet` instead of Unistyles.
- **`src/components/app-tabs.tsx`** is the only consumer of `assets/images/tabIcons/`, so
  deleting it orphans those assets.
- **`src/hooks/`** — `use-color-scheme*.ts` unused. `use-theme.ts` is live (used by
  `ThemedText`/`ThemedView`).
- **`CardDisplayModeSwitch`** — orphaned. Card details hardcodes `displayMode="collectible"`,
  so the `cardDisplayMode` preference is inert. Tracked in
  [`discovery-questions.md`](./discovery-questions.md).
- **`*Labels` records** in `shared/constants/party-options.ts` — unused by the UI (labels
  come from i18n), but TypeScript forces you to update them when adding enum values. Keep
  them, they are the compile-time guard.
- **`getCardsForParty`** in `features/cards/selectors.ts` — unused; the party-details
  screen model duplicates its filter+sort inline. Either reuse it there or drop it.
- **`src/constants/theme.ts`** — `Colors` is live (`_layout.tsx` reads it for header
  colors). `Fonts`, `Radius`, and `MaxContentWidth` are referenced only by dead starter
  files; live components read `theme.radius` / `theme.spacing` through Unistyles.
- **`console.log` in `settings.tsx`** — leftover debug output on a shipped screen.
- **Generation errors bypass i18n.** Both catch blocks do
  `error instanceof Error ? error.message : t('...')`
  (`use-new-character-card-form.ts:102`, `use-card-details-actions.ts:98`). The Gemini SDK
  (`ApiError extends Error`) and the network layer throw real `Error` instances — including
  offline (`TypeError: Network request failed`), 4xx auth failures, and invalid-JSON
  responses — so `error.message` almost always wins and the translated `generationFailed` /
  `regenerationFailed` strings are near-dead code. Net effect: users see raw English
  SDK/debug text, untranslated, including in Polish. Generation requires connectivity, so the
  offline failure is a common path rather than an edge case — map failures to translated keys
  and keep `error.message` for logs only.
- **Manual memoization against React Compiler.** `party/[partyId]/card/new.tsx:21` wraps
  `getPartyById(parties, partyId)` in `useMemo`. That is the only `useMemo`/`useCallback`
  left in `src`, and it is redundant with the compiler enabled. Drop it rather than copy
  the pattern. `npm run healthcheck:react-compiler` flags these.

## Verification

No test runner is configured. Nothing here is automated:

- `npm run check` — lint (`expo lint`), then `tsc --noEmit`, then `npm run contrast`. Requires `npm install` first.
- `npm run contrast` — `scripts/contrast-check.mjs` parses the palettes out of
  `src/shared/theme/unistyles.ts` and applies one WCAG rule set to every theme. Plain Node, no test runner.
- `npm run format` — Prettier: no semicolons, single quotes.
- `.claude/settings.json` auto-runs `eslint --fix` + `prettier --write` on edited files.
- Runtime QA is manual or agent-driven. See
  [`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md).
- `npm run healthcheck:react-compiler` exists but is not wired into `check`.

### `npm run typecheck` fails on a clean checkout

`tsc --noEmit` reports 15 errors on a clean tree. Lint passes. All are i18n typing, none in
app logic:

`src/shared/i18n/labels.ts` (5), `party/new.tsx` (2), `party/[partyId]/card/new.tsx` (1),
`new-character-card-form.tsx` (4), `party-meta-line.tsx` (2), `card-display-mode-switch.tsx` (1).

Reproduce before assuming a change of yours caused them: if the count and files match the
list above, they are these.

**Root cause.** i18next 26 custom types accept an `ns:` key prefix only when `t` knows two
or more namespaces. `labels.ts` helpers take a bare `TFunction` and prefix every key with
`common:` — the default namespace — so those `t()` calls are rejected and return `unknown`
instead of `string`. That `unknown` cascades into every `getLabel={(o) => getXxxLabel(t, o)}`
call site and any place interpolating the result. Keys are valid at runtime; only the types
are wrong.

**Fix (2 files, clears all 15).** Both edits are required:

1. In `src/shared/i18n/labels.ts`, drop the `common:` prefix from all five keys —
   `common` is `defaultNS`, so bare keys resolve.
2. In `src/features/cards/components/new-character-card-form.tsx:40`, widen
   `useTranslation(['cards'])` to `useTranslation(['common', 'cards'])`. Without this, the
   component's `t` is `TFunction<readonly ["cards"]>`, which is not assignable to the
   `TFunction<'common'>` the helpers require.

This is runtime-safe: the default namespace for a `t` from `useTranslation(['common', 'cards'])`
is the first entry, and `createResourceTranslator` in `generation.ts` strips a leading
`common:` when present and leaves bare keys untouched, so both forms resolve there.

**Do not "fix" this by loosening `tsconfig` or deleting `i18next.d.ts`.** The custom types
are what catch missing keys in `en`.

**Expect 15 errors from `npm run check`** while this stands. Count them and compare against
the list above rather than assuming a clean build.

Because there are no tests, the smoke-test runbook is the only regression net. Changes to
persistence, card lifecycle, or cascade deletes deserve a simulator pass.
