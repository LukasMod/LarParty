# Architecture

How the code works. Where this and the code disagree, the code wins — fix this file.

Small codebase: ~80 TypeScript files, ~4.3k lines, 72 of them under 100 lines. Reading the
real file is often faster than reading prose.

## Stack

| Concern             | Choice                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| Runtime             | Expo SDK 58 beta, React Native 0.88.0-rc.3, React 19.3.0, New Architecture on  |
| Routing             | Expo Router, typed routes on                                                   |
| Styling             | react-native-unistyles v3 (babel plugin scoped to `src`)                       |
| State + persistence | Zustand v5 + `persist` → MMKV (`react-native-mmkv` v4, Nitro)                  |
| Validation          | Zod v4 (AI response only)                                                      |
| i18n                | i18next + react-i18next, en + pl                                               |
| AI                  | `@google/genai`, `gemini-3.6-flash-lite`                                       |
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
    parties/  cards/        types.ts, selectors.ts, utils/, store/, hooks/, components/
    preferences/store/      display mode + language preference
    generation/             gemini.ts, prompt.ts, schemas.ts, types.ts, utils/, hooks/, components/
  hooks/                    starter hooks; only use-theme.ts is live
  shared/
    components/ constants/ hooks/ i18n/ storage/ theme/ utils/
jest/                       setup stubs + test factories (`@test/factories`)
```

`shared/utils/` is where testable logic goes when it is not feature-specific:
`tilt.ts` (pose math), `hash.ts` (glow seed offset), `fixtures.ts` (deterministic debug
index math), `error.ts` (thrown-value → message), `create-id.ts`.

Feature module convention (`parties`, `cards`):

| Dir/file                                       | Contract                                                                                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                                     | Domain interfaces + types derived from `shared/constants` enums                                                                                           |
| `selectors.ts`                                 | Pure functions over arrays. No store access                                                                                                               |
| `utils/`                                       | Pure functions: form validation, screen-model resolution, list building. Every branch worth breaking lives here, with tests in `utils/__tests__/`         |
| `store/<name>-store.ts`                        | Zustand + persist. Owns all writes                                                                                                                        |
| `hooks/use-*-screen-model.ts`                  | Read side. Selects store state, hands it to a `utils/` resolver, returns a discriminated `status` union                                                   |
| `hooks/use-*-actions.ts` / `use-new-*-form.ts` | Write side. Alerts, navigation, and calling `utils/` validators. No inline branching logic                                                                |
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
screen-model hook, which selects store state and hands it to a pure resolver in the
feature's `utils/` — `resolveCardDetailsScreenModel` and
`resolvePartyDetailsScreenModel` — returning a discriminated union:

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
- **Removing an enum value affects existing local data.** A saved party holding a value absent
  from `themeCategories` hits a total map (`getPartyTheme` returns `undefined`) and
  `partyTheme.colors.accent` throws — a white screen on party and card details. A saved entity
  holding a removed mood or trait renders the raw i18next key in place of a label, and the
  prompt sends that key to the model. There is no migration layer. The MVP has no users, so
  the accepted handling is to clear local storage (or reinstall) after trimming any enum; a
  fresh install never holds a dropped value. If real installs ever hold data, add a `persist`
  `version` + `migrate` first.

## Domain rules worth knowing before editing

- A card belongs to exactly one party via `partyId`.
- Generation always saves a **draft**. `acceptCard` flips status; nothing else does.
- Regenerate creates a **new** card carrying `basedOnCardId` (previous card) and reusing
  `generationGroupId`. If `generationGroupId` is absent, `createDraftCard` mints one, so
  the first generation also establishes a group. Accepted versions are never overwritten.
  Grouping by `generationGroupId` is what keeps version history queryable without a separate
  versioning engine.
- `generated.characterTraits` is a 3-tuple in both the TS type and the Zod schema.
- Trait selection is capped at 3 (`MAX_CARD_TRAITS` in `features/cards/utils/card-form.ts`).
- Form validation is hand-rolled pure functions in `features/*/utils/*-form.ts` — no schema
  library. Zod guards **only** AI output. There is no `shared/validation/` directory.

## Generation flow

Generation is always remote. There is no offline or on-device path: `generateCharacterCard`
calls Gemini over the network, so creating/regenerating a card requires internet. Offline
only the read/browse flows work (see [`mvp-decisions.md`](./mvp-decisions.md)).

`prompt.ts` builds a text prompt; `gemini.ts` calls `generateContent` with
`responseMimeType: 'application/json'`, `generatedCharacterCardJsonSchema`, and creative
sampling (`temperature: 1.15`, `topP: 0.95`) so the same seed does not keep returning the same
card. `gemini.ts` hands the response text to `parseGeneratedCardResponse` — which rejects empty
text, rejects non-JSON, and finally runs `generatedCharacterCardSchema.parse(...)`, so malformed
or off-schema AI output throws rather than saving bad data. Errors bubble to the form hook, which
sets `errorMessage` and saves nothing.

The prompt has five parts: the party setup, the character seed, a uniqueness section, an optional
divergence section, and the field rules. Uniqueness tells the model to skip the archetype the
trait set implies, include one detail too specific to fit another guest, and avoid a named list of
stock setups. `getPromptSiblings()` (`generation/utils/party-context.ts`) reads the party's other
cards from the store inside the generate handler and renders them as one-line summaries (name,
traits, phrase, movement; newest first, capped by `MAX_PARTY_SIBLING_SUMMARIES`), which the prompt
forbids repeating. Variants of the card being regenerated are excluded — they share its seed.
`getGenerationAttempt()` counts cards in the same `generationGroupId`, so regeneration adds a
divergence block ("variant 3 for this exact seed") that holds the traits fixed and changes
everything else. The first generation gets neither block.

The form writes a signed intensity per selected trait into `input.traitLevels` (`-3..3`, default
`0`, absent entry reads as `0`). `generation/utils/seed-traits.ts` turns those into
`{ trait, traitValue }` seeds, clamped in `generation/utils/trait-value.ts`; a request can override
them with explicit `seedTraits`. A saved card keeps `input.traitLevels`, so regeneration reads the
same values with no extra plumbing. When every value is `0` the prompt prints
a plain comma-separated trait list; once any value leaves `0` it prints one labelled line per
trait with its signed value and wording (`describeTraitValue`), then the `traitValueScaleLines`
contract: `0` is the trait plain, `3` is excess rather than a superpower, `-3` is the exact
opposite held as a principle, a value never shifts the mood or another trait, a negative value is
a comedy hook and never tragedy, and no number appears in generated text. The loudest value also
pins the `generatedNameWithClass` and `specialMovement` rules. `generation/utils/seed-traits.ts`
owns that rendering. An input with no levels keeps getting the default prompt unchanged.
`getPromptSiblings()` reads each sibling's own `input.traitLevels`, so tuned values show up in
anti-similarity context without extra plumbing.

Two schemas must stay in lockstep with the domain type: the hand-written Gemini JSON
schema and the Zod schema, both in `schemas.ts`, plus `CharacterCardGenerated` in
`features/cards/types.ts`. Changing generated fields means editing all three.

Both write hooks (`use-new-character-card-form.ts`, `use-card-details-actions.ts`) call
`useCharacterCardGeneration()` (`generation/hooks/`) instead of `generateCharacterCard`
directly. That hook owns one `AbortController` per request, exposes `{ isGenerating, start,
cancel }`, and reports `{ generated, cancelled }`. While `isGenerating` is true the screen
renders `GeneratingOverlay` (`generation/components/`) — a full-screen `Modal` with a Cancel
button — and sets `gestureEnabled: false` on its `Stack.Screen` so the iOS swipe-back cannot
leave mid-request. Cancel aborts the signal, and `start()` resolves as `cancelled`; the hooks
then return early without saving a draft. `gemini.ts` forwards the request's `signal` into
`generateContent`'s `config.abortSignal`, so cancelling also aborts the HTTP call.

The generator sits behind a `CharacterCardGenerator` interface, and
`getCharacterCardGenerator()` caches a singleton. That seam is the intended place for a
backend swap; the key is `EXPO_PUBLIC_GEMINI_API_KEY`, i.e. baked into the client bundle.
Fine for the PoC, not for release.

Output language follows the resolved app language. See [`i18n-guide.md`](./i18n-guide.md).

## Debug tools (dev only)

`src/shared/debug/` seeds the persisted stores with fake data so screens, lists, and
cascade deletes can be exercised without any Gemini call or API key.

| File                          | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug-data.ts`               | Pure fake-data builders. `generateDebugData(partyCount, cardsPerParty)` returns `{ parties, cards }`; `buildSmallDebugDataset()` and `buildLargeDebugDataset()` are the two presets (3 parties × 1 card; 10 parties × 10 cards). Party titles/classes/movements/phrases are theme-aware per `themeCategory`; names/sex/traits cycle shared pools deterministically (index-based, no RNG — the index math itself is `shared/utils/fixtures.ts`). Roughly every fifth card gets a `basedOnCardId` sibling in the same `generationGroupId` so card details shows version history. Statuses mix draft/accepted. Arrays are returned newest-first to match the prepend order the lists render. |
| `use-debug-actions.ts`        | Write side. `seed(...)` calls `usePartyStore.setState` / `useCardStore.setState` with `hasHydrated: true`, then `router.replace('/')`. `handleClear` alerts, then empties both stores.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `debug-menu.tsx`              | The `DebugMenu` card: small-seed, large-seed, and clear buttons.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `level-slider-playground.tsx` | `LevelSliderPlayground` card: one live `LevelSlider` held in local state, so the snap, the velocity handoff, and the haptics can be feel-checked in isolation from the trait form.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

- Reached from **Settings** only under `__DEV__` (`{__DEV__ ? <DebugMenu /> : null}` and
  `{__DEV__ ? <LevelSliderPlayground /> : null}` in `src/app/settings.tsx`); neither component
  has a runtime guard of its own. Copy lives in the `debug` i18n namespace.
- Seed **overwrites** all parties and cards (it does not append). Clear removes everything
  on the device. Both persist to MMKV, so the data survives a reload — clear it before a
  run that needs a known empty state.
- For agents: this is the fast way to get list/details/cascade-delete coverage without
  spending API calls. See [`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md).

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

## Motion

Reanimated v4 with `react-native-worklets`; the worklets babel plugin is injected by
`babel-preset-expo`, so `babel.config.js` does not list it. Reference patterns: the breathing
halo in `shared/components/card-glow.tsx` and the overlay in
`features/generation/components/generating-overlay.tsx`. Both animate only `opacity`/`transform`,
so the loops stay on the UI thread.

`GestureDetector` needs a `GestureHandlerRootView` above it and expo-router's stack does not supply
one, so `src/app/_layout.tsx` wraps the whole stack in one. Without it every gesture throws in dev.

`shared/components/level-slider.tsx` is the other reference: a pan gesture, a shared value, and
`useAnimatedStyle` move the knob and a column of level labels with no React render while a finger
is down. The snap on release is a spring (`duration: 380`, `dampingRatio: 0.7`) that receives the
finger's velocity, so a short push that stops before a tick still lands on it. Two constraints
that shaped it:

- The level is reported back to the React runtime as the drag **crosses a notch**, so a host
  that shows the number tracks the knob instead of waiting for the release. `onFinalize` (not
  `onEnd`) reports again, so a drag the system takes over — a scroll that wins the gesture —
  still lands the value and snaps the knob home. `commit` dedupes on the `parkedLevel` shared
  value, which is current, rather than the `value` prop, which can be a render behind, so the
  release report after an identical crossing is a no-op. Calls cross through `scheduleOnRN`
  from `react-native-worklets`: once per notch, never per frame.
- The "is the parent's `value` the one we just committed" bookkeeping lives in shared values
  (`parkedLevel` / `parkedSpacing`), not a ref. `commit` is reachable from a worklet, and
  `react-hooks/refs` rejects a ref read in a closure a worklet can call.

The new-card form puts one `LevelSlider` per selected trait under the trait chips
(`features/cards/components/trait-level-row.tsx`, listed by `trait-level-list.tsx`). Each row is
wrapped in `shared/components/collapse.tsx`, which grows and shrinks its own height on the UI
runtime using the accordion shape from Reanimated's docs: the content is measured once into a
shared value and the visible height is that measurement times an animated 0→1 value. So the form
card gets taller when a trait is picked and shorter when it is dropped, with no `LayoutAnimation`
and no timer deciding when to unmount.

Three things this depends on:

- The measured content is `position: absolute`. In flow, a child collapses with its zero-height
  parent and reports height 0 to `onLayout` forever, which pins the row shut.
- Deselected rows stay mounted at zero height — an exit animation needs its content still there.
  That is why the list renders a row per *offered* trait, not per selected one, and why a collapsed
  row is marked `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"`:
  otherwise a hidden slider stays reachable in the screen-reader tree.
- Spacing is each row's own top padding, and the list is a single wrapper child. A `gap` on the
  host would put space around every zero-height row and leave holes under the chips.

`Collapse` hides its subtree from screen readers while closed, and snaps open/closed instantly when
reduce motion is on.

Card details wraps the card in `shared/components/tilt-card.tsx`, which leans the card a few
degrees with the phone's physical orientation. The pieces:

- `shared/utils/tilt.ts` — the whole effect as pure functions and tunables. `DEFAULT_TILT_CONFIG`
  holds `maxDegrees`, `maxShift`, `deadZoneDegrees`, `perspective`, and the `signX`/`signY` axis
  flips. `TILT_EFFECTS_ENABLED` is the kill switch: set it false and cards render as plain views
  with no sensor and no frame loop.
- `shared/hooks/use-tilt-pose.ts` — reads `SensorType.ROTATION` through `useAnimatedSensor` and
  eases a pose toward it in a `useFrameCallback` loop. All sampling and easing happens in worklets.
- `shared/hooks/use-reduce-motion.ts` — the live reduce-motion flag, shared by tilt and
  `CardGlow`.

Three constraints that shaped this and are easy to get wrong again:

- Reanimated gives no way to pause a sensor, and the `unregister` on the returned object is a
  no-op until the next render (`useAnimatedSensor` assigns it in an effect). Stopping sampling
  therefore means unmounting `useTiltPose`, so `TiltCard` renders a plain `View` whenever tilt
  should not run and mounts the sampler otherwise. That swap remounts the card subtree, which is
  off-screen on blur and instantaneous for a reduce-motion change — where snapping flat is wanted.
- `iosReferenceFrame` is pinned to `XArbitraryZVertical`. The `Auto` default picks the
  magnetometer-corrected frame, which needs iOS Location Services enabled and drifts toward
  magnetic north. Yaw is unused because an arbitrary X axis makes it meaningless.
- Writes to worklet-captured shared values come from worklets only. `react-hooks/immutability`
  rejects `.value =` from an effect, so the on/off decision lives in which component mounts, not
  in a shared-value flag written from JS.

Tilt is native-only: web would need the DeviceMotion API, which requires HTTPS plus a
gesture-triggered prompt. It also rests when reduce motion is on.

Needs a physical device. A simulator has no motion hardware, so the pose stays fixed instead of
following the hand — it can sit at a small constant lean, which is expected and not a bug. If the
card leans away from the phone rather than into it, flip `signX`/`signY`.

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
- **`src/constants/theme.ts`** — `Colors` is live (`_layout.tsx` reads it for header
  colors). `Fonts`, `Radius`, and `MaxContentWidth` are referenced only by dead starter
  files; live components read `theme.radius` / `theme.spacing` through Unistyles.
- **`console.log` in `settings.tsx`** — leftover debug output on a shipped screen.
- **A superseded generation is not reported as cancelled.** `start()` aborts the previous
  request's controller but never sets its `cancelled` flag — only `cancel()` does. A caller
  awaiting the superseded `start()` therefore gets `{ generated, cancelled: false }` and would
  save a draft and navigate, even though a newer generation is in flight. Today two screens
  cannot generate simultaneously: the `GeneratingOverlay` covers the form and blocks a second
  tap, and each hook instance owns its own `activeRef`. It becomes reachable if a second
  generation can start while one is in flight. Set `cancelled` on the aborted entry inside
  `start()` rather than only in `cancel()` if that changes.
- **Generation errors bypass i18n.** Both catch blocks call
  `resolveErrorMessage(error, t('...'))` (`shared/utils/error.ts`), which prefers
  `error.message` over the translated fallback. The Gemini SDK (`ApiError extends Error`) and
  the network layer throw real `Error` instances — including offline (`TypeError: Network
request failed`), 4xx auth failures, and invalid-JSON responses — so `error.message` almost
  always wins and the translated `generationFailed` / `regenerationFailed` strings are
  near-dead code. Net effect: users see raw English
  SDK/debug text, untranslated, including in Polish. Generation requires connectivity, so the
  offline failure is a common path rather than an edge case — map failures to translated keys
  and keep `error.message` for logs only.
- **Manual memoization against React Compiler.** `party/[partyId]/card/new.tsx:21` wraps
  `getPartyById(parties, partyId)` in `useMemo`. That is the only `useMemo`/`useCallback`
  left in `src`, and it is redundant with the compiler enabled. Drop it rather than copy
  the pattern. `npm run healthcheck:react-compiler` flags these.

## Verification

- `npm run test` — Jest with the `jest-expo` preset. `jest.config.js` maps `@/` to `src/`
  and `@test/` to `jest/`; `jest/setup.ts` stubs MMKV, `expo-localization`, and the
  Unistyles native registration, and `jest/setup-after-env.ts` registers the
  `@testing-library/react-native` matchers. Domain/test builders live in
  `jest/factories.ts` (`makeParty`, `makeCard`, `makeCardInput`, `makeGenerated`).
- Pure logic is the test target. Anything with a branch worth breaking sits in a
  `utils/` folder (feature) or `src/shared/utils/`, so the hook or component around it
  is just wiring. `src/shared/utils`, `src/shared/theme`, `src/shared/storage`,
  `src/features/*/utils`, `src/features/*/selectors.ts`, and the three stores are at full
  line and branch coverage; components and route files are not unit-tested.
- Work that needs a device stays manual: the gyroscope tilt loop, Reanimated glow, and
  gesture handling. `poseFromRotation`, `lerpPose`, and `smoothingFactor` in
  `src/shared/utils/tilt.ts` are tested as plain math because they are `'worklet'`
  functions that also run on the JS thread.
- Run one file: `npx jest src/features/cards/utils/__tests__/card-form.test.ts`.
- `npm run check` — lint (`expo lint`), then `tsc --noEmit`, then `npm run contrast`. Requires `npm install` first.
- `npm run contrast` — `scripts/contrast-check.mjs` parses the palettes out of
  `src/shared/theme/unistyles.ts` and applies one WCAG rule set to every theme. Plain Node, no test runner.
- `npm run format` — Prettier: no semicolons, single quotes.
- `.claude/settings.json` auto-runs `eslint --fix` + `prettier --write` on edited files.
- Runtime QA is manual or agent-driven. See
  [`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md).
- `npm run healthcheck:react-compiler` exists but is not wired into `check`.
- `watchman` is disabled in `jest.config.js`, so Jest falls back to its own file walker.

### Enum labels resolve `common` keys bare

`tsc --noEmit` passes on a clean tree. The `labels.ts` helpers build their keys without the
`common:` prefix — `t('options.sex.male')`, not `t('common:options.sex.male')`. `common` is
`defaultNS`, so bare keys resolve at runtime.

This matters because of how i18next 26 custom types behave: an `ns:` prefix is accepted only
when the `t` knows two or more namespaces. `labels.ts` helpers take a bare `TFunction`, which
resolves to the `defaultNS`, so a `common:`-prefixed key there is rejected as unknown and the
call returns `unknown` instead of `string`. That `unknown` cascades into every
`getLabel={(o) => getXxxLabel(t, o)}` call site and anywhere the result is interpolated.

Two rules keep it green:

1. `src/shared/i18n/labels.ts` prefixes nothing — `common` is the default namespace.
2. A component whose `t` is handed to those helpers must know `common`. In
   `new-character-card-form.tsx` that is `useTranslation(['common', 'cards'])`. A `t` typed
   to `readonly ["cards"]` is not assignable to the `TFunction<'common'>` the helpers take.

`createResourceTranslator` in `generation.ts` strips a leading `common:` when present and
leaves bare keys untouched, so the prompt path accepts either form.

**Do not weaken this by loosening `tsconfig` or deleting `i18next.d.ts`.** The custom types
are what catch missing keys in `en`.

Separately, `tsconfig.json` sets `"customConditions": ["react-native", "react-native-legacy-deep-imports"]`.
That is React Native's opt-out from the Strict TypeScript API that became the default in 0.87
(deep imports from `react-native/Libraries/*` would otherwise be type errors, refs use
instance types). Removing it surfaces about a dozen `StyleProp<ViewStyle>` and ref-assignability
errors across `src/shared/components/*` — `screen.tsx`, `form-card.tsx`, `tilt-card.tsx`,
`card-glow.tsx`, `collapse.tsx` and peers — none of them i18n. The opt-out is removed after RN
0.88, so the strict-API migration is owed before RN 0.89.

`npm run check` is clean on this tree: lint, typecheck and contrast all pass.

`npm run test` covers the pure seams — selectors, screen-model resolvers, form validation,
schema parsing, cascade-delete store logic, the theme map, and the tilt math. The screens
themselves have no automated coverage, so a change to a route or a component deserves a
simulator pass against the smoke-test runbook.
