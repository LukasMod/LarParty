# react-i18next internationalization plan

## Goal

Add app-level internationalization with [`react-i18next`](https://github.com/i18next/react-i18next) and a small dedicated Settings screen so LarParty can:

- render app chrome and form copy in the selected language
- default to the device locale while allowing a persisted manual override
- pass the active output language into AI generation so generated card content matches the current app language
- keep the implementation small enough for the current MVP, but structured to scale

## Guide review: what we keep and what we improve

Reference reviewed:
- https://medium.com/@kgkrool/implementing-internationalization-in-expo-react-native-i18next-expo-localization-8ed810ad4455

The guide is a good **baseline** for Expo + React Native internationalization, but it is too minimal for LarParty's needs.

### Useful ideas to keep from the guide

- install `expo-localization`, `i18next`, and `react-i18next`
- initialize i18next once in a dedicated module
- import the i18n setup near app root
- register local translation resources for each language
- use `useTranslation()` in components
- configure `fallbackLng`
- set `interpolation.escapeValue = false`

### What we should improve beyond the guide

- persist a **user-selected language override** instead of only reading device language
- add a dedicated **Settings** screen for language selection
- handle supported-language resolution more explicitly
- use pluralization instead of manual `card/cards` branching
- keep navigation titles reactive to language changes
- pass the current language into AI generation
- avoid relying only on startup `getLocales()[0]`

### Expo-specific update from current docs

Current Expo docs show:
- `getLocales()` is valid for locale detection
- on **Android**, locale settings can change while the app is running, so locale should be refreshed when the app returns to foreground
- Expo also provides `useLocales()`, which rerenders when OS locale settings change

### Plan decision based on the guide + current docs

For LarParty, prefer:
- `react-i18next` + `i18next`
- `expo-localization`
- a persisted preference: `'system' | 'en' | 'pl'`
- a resolved language derived from the preference plus Expo locale data
- a root language-sync hook that is aware of locale changes

Prefer `useLocales()` in React code rather than relying only on a one-time `getLocales()[0]` at startup.

## Recommended product/UI approach

Use a **dedicated Settings screen** instead of a modal or inline control.

### Why this is the best fit

- The app already uses stack navigation; another lightweight route is cheap.
- Language is a durable preference, so a stable screen is clearer than an ephemeral modal.
- It scales naturally if we later add theme, prompt style, or card-view preferences.
- It keeps the party list focused on the main flow.

### Proposed UX

- Add a Settings entry point on the party list screen header.
- Add a new `/settings` route with a simple form-card layout.
- Show an **App language** section with options:
  - System default
  - English
  - Polish
- Selecting a language applies immediately.
- Show the current effective language and, for `system`, the detected device language label.
- For MVP, keep selection inline on the screen rather than opening a second modal.

## Current codebase findings

### Screens and routes with visible copy

#### `src/app/_layout.tsx`
- Static stack titles:
  - `LarParty`
  - `New Party`
  - `Party Details`
  - `New Character Card`
  - `Character Card`
- Needs:
  - translated titles
  - new `settings` route title
  - likely move static `options={{ title: ... }}` toward `options={() => ({ title: t(...) })}` pattern inside a layout component that can read i18n state

#### `src/app/index.tsx`
- Home hero/subtitle
- Loading empty-state card strings
- Empty-party state strings
- CTA label: `Create a new party`
- Needs:
  - translated screen copy
  - likely add header-right settings button

#### `src/app/party/new.tsx`
- `Create Party`
- field labels: `Party name`, `Theme category`, `Mood`
- validation helper: `Party name is required.`
- placeholder: `Friday Tavern Night`
- submit button: `Save party`

#### `src/app/party/[partyId].tsx`
- loading and missing-state strings
- CTA: `Create a character card`
- destructive CTA: `Delete party`
- party title itself remains user content, not translated

#### `src/app/party/[partyId]/card/new.tsx`
- missing-state strings
- header title: `Create Character Card`
- generate button state labels:
  - `Generating...`
  - `Generate character card`
- subtitle mixes user content + label from constants

#### `src/app/party/[partyId]/card/[cardId].tsx`
- loading and missing-state strings
- status labels:
  - `Accepted card`
  - `Draft card`

#### `src/app/explore.tsx`
- Not in the primary flow, but still contains visible strings and should be translated if retained.

### Feature components with visible copy

#### `src/features/parties/components/party-list-item.tsx`
- count label: `card` / `cards`
- should become pluralized translation key

#### `src/features/parties/components/party-meta-line.tsx`
- displays `themeCategoryLabels` and `partyMoodLabels`
- current option labels are hardcoded English constants
- needs a strategy change: option values stay stable, labels move to i18n

#### `src/features/cards/components/party-card-list-section.tsx`
- section title: `Character Cards`
- empty text: `No cards yet. This party is ready for its first character.`

#### `src/features/cards/components/character-card-list-item.tsx`
- status labels: `Accepted` / `Draft`

#### `src/features/cards/components/card-display-mode-switch.tsx`
- mode labels: `Collectible view` / `Info view`

#### `src/features/cards/components/card-history-section.tsx`
- section title: `Background`

#### `src/features/cards/components/card-traits-section.tsx`
- section title: `Character traits`

#### `src/features/cards/components/card-special-movement-section.tsx`
- section title: `Special movement`

#### `src/features/cards/components/card-special-phrase-section.tsx`
- section title: `Special phrase`

#### `src/features/cards/components/new-character-card-form.tsx`
- labels: `Character name`, `Sex`, `Age`, `Traits`
- placeholders: `Mira Nightbloom`, `25`
- helper text: `Pick up to ${maxTraits} traits.`
- uses option labels from constants (`sexOptionLabels`, `cardTraitLabels`)

#### Shared components
- `src/shared/components/screen-state-card.tsx` and `src/shared/components/form-field.tsx` are already string-agnostic wrappers
- `src/shared/components/button.tsx` is string-agnostic once call sites translate labels before passing them

### Hooks and action copy

#### `src/features/parties/hooks/use-new-party-form.ts`
- currently only toggles validation state; actual visible validation helper lives in the screen
- no structural blocker for i18n

#### `src/features/parties/hooks/use-party-details-actions.ts`
- alert copy:
  - `Delete party?`
  - `Remove ${party.title} and all saved cards?`
  - `Cancel`
  - `Delete`

#### `src/features/cards/hooks/use-new-character-card-form.ts`
- visible error messages:
  - `Party not found.`
  - `Character name is required.`
  - `Enter a valid age.`
  - `Choose between 1 and 3 traits.`
  - fallback from thrown errors: `Unable to generate card right now.`
- this hook currently stores final localized strings in state; better to store an error code/key and translate at render time, or pass `t` into the hook if we want minimal churn

#### `src/features/cards/hooks/use-card-details-actions.ts`
- alert copy:
  - `Delete card?`
  - `Remove this saved character card?`
  - `Cancel`
  - `Delete`
  - `Regenerate card?`
  - `Create a new draft variation from the same character input?`
  - `Regenerate`
- fallback error string:
  - `Unable to regenerate card right now.`

### Constants that must stop owning English labels

#### `src/shared/constants/party-options.ts`
Current English label maps:
- `themeCategoryLabels`
- `partyMoodLabels`
- `cardTraitLabels`
- `sexOptionLabels`

Recommendation:
- keep the value arrays (`themeCategories`, `partyMoods`, `cardTraits`, `sexOptions`, `cardDisplayModes`)
- remove or phase out the English label records from UI usage
- replace with helper functions or direct translation keys, e.g.:
  - `t('options.themeCategory.fantasy')`
  - `t('options.partyMood.chaotic')`
  - `t('options.cardTrait.loyal')`
  - `t('options.sex.female')`
  - `t('preferences.cardDisplayMode.collectible')`

### AI generation flow findings

#### `src/features/generation/prompt.ts`
- prompt text is English only today
- party metadata and input labels are also injected in English
- selected trait labels are derived from hardcoded English label maps
- needs explicit language instruction so generated JSON values come back in the active UI language

#### `src/features/generation/gemini.ts`
- generator accepts `GenerateCharacterCardRequest`
- we should extend request data to include the active language, likely as a stable code like `en` / `pl`

## Recommended technical design

## 1. Library stack

Use:
- `i18next`
- `react-i18next`
- `expo-localization`

Per current react-i18next docs, initialize i18next with `initReactI18next`, then use `useTranslation()` in components and `i18n.changeLanguage()` for runtime switching.

## 2. Locale model

Introduce two related concepts:

- **user preference**: `'system' | 'en' | 'pl'`
- **resolved app language**: `'en' | 'pl'`

This separation lets us:
- persist user intent cleanly
- react to device locale changes when preference is `system`
- pass a stable language code to prompts and formatting

## 3. Store changes

Extend `src/features/preferences/store/preferences-store.ts` and `src/features/preferences/types.ts` with:
- `languagePreference: 'system' | 'en' | 'pl'`
- setter action

Keep `cardDisplayMode` in the same store.

Potential shape:
- `languagePreference`
- `setLanguagePreference(languagePreference)`

Do **not** persist the resolved language separately; derive it from preference + device locale.

## 4. i18n bootstrap

Add a shared i18n module, e.g.:
- `src/shared/i18n/index.ts`
- `src/shared/i18n/resources.ts`
- `src/shared/i18n/types.ts` or `src/shared/i18n/i18next.d.ts`

Responsibilities:
- register `initReactI18next`
- provide bundled resources from local JSON/TS objects
- set `fallbackLng: 'en'`
- set `defaultNS`
- set `returnNull: false` for better TS ergonomics if needed
- set `interpolation.escapeValue = false`
- expose helpers for resolving locale codes from `expo-localization`

Recommended namespace split:
- `common`
- `parties`
- `cards`
- `settings`
- `generation` (only if we want prompt-related label fragments centralized)

For this app, we can start with `common`, `parties`, `cards`, `settings` and still keep prompt instruction templates in code.

## 5. App wiring

### Root initialization
- import the i18n bootstrap once near app root, likely in `src/app/_layout.tsx`
- wrap stack in `I18nextProvider` only if needed; in many app setups, importing initialized i18n is enough because hooks read the shared instance. Using `I18nextProvider` is still explicit and safe.

### Runtime language sync
- create a small hook, e.g. `use-app-language.ts`, that:
  - reads `languagePreference` from preferences store
  - reads locale data from `expo-localization`
  - resolves to supported language
  - calls `i18n.changeLanguage(resolvedLanguage)` in an effect when needed
- prefer `useLocales()` in React code so the app can react to OS locale changes
- root layout should run this hook once so navigation titles and all screens stay in sync

### Locale resolution behavior
- if preference is `en` or `pl`, use it directly
- if preference is `system`, resolve from Expo locale data
- if the device language is unsupported, fall back to `en`
- for current MVP, matching by language code is enough

## 6. Route and header strategy

Because `_layout.tsx` currently hardcodes English titles, shift to translated titles.

Recommended pattern:
- use `useTranslation()` in `RootLayout`
- define `options={{ title: t('...') }}` directly inside the component render
- add `settings` screen title there too

For party/card detail screens, keep route titles generic and translated; dynamic page body content can remain in-screen.

## 7. Translation key strategy

Prefer semantic keys over using English strings as keys.

Examples:
- `common.actions.save`
- `common.actions.delete`
- `common.actions.cancel`
- `parties.list.emptyTitle`
- `parties.form.nameLabel`
- `cards.form.generate`
- `cards.form.generating`
- `cards.sections.background`
- `settings.language.system`

For repeated status values, prefer one shared location, e.g.:
- `common.status.accepted`
- `common.status.draft`

## 8. Dynamic options strategy

Replace label maps with translator helpers.

Example direction:
- `getThemeCategoryLabel(t, value)`
- `getPartyMoodLabel(t, value)`
- `getCardTraitLabel(t, value)`
- `getSexOptionLabel(t, value)`

or simpler, call `t()` inline at call sites using predictable keys.

Inline keys are likely sufficient and keep the implementation smaller.

## 9. Error/alert translation strategy

For minimal MVP churn:
- translating directly inside hooks is acceptable by importing `i18n` or using `useTranslation()` inside hooks that are React hooks
- alerts can call `t(...)` at trigger time

For better long-term structure:
- store machine-friendly error codes in hook state and translate in components

Recommended compromise:
- keep local string state for now only where necessary
- but prefer translating at the moment of setting the error so the implementation stays straightforward
- note that already-visible error text will not auto-retranslate if language changes mid-error; acceptable for MVP

If you want stronger behavior, we can instead store error keys.

## 10. AI prompt language support

Update generation request and prompt builder so generated content matches the current app language.

### Required data model change
Extend the generation request with something like:
- `outputLanguage: 'en' | 'pl'`

### Prompt change
Add an explicit rule such as:
- `Write all generated field values in <language name>.`
- `Return only valid JSON matching the requested schema.`
- `Keep keys/schema unchanged; only the string values should be in <language>.`

Also localize the metadata values injected into the prompt:
- theme category label in current language
- mood label in current language
- selected trait labels in current language
- sex label in current language

This gives the model both:
- a direct output-language instruction
- localized semantic context for category/mood/trait labels

### Recommended exact behavior
- If app is in English, generated fields stay English.
- If app is in Polish, generated fields should be Polish.
- Existing saved cards remain in whatever language they were generated in; no migration needed.

## 11. Formatting and plurals

Use i18next pluralization for party/card counts rather than manual ternaries.

Example need:
- `{{count}} card`
- `{{count}} cards`

For current scope, there are no date/currency displays yet, so `Intl` formatting can be deferred until such values appear.

## 12. Suggested file structure

```text
src/
  app/
    _layout.tsx
    settings.tsx
  features/
    preferences/
      store/preferences-store.ts
      types.ts
  shared/
    i18n/
      index.ts
      resources.ts
      i18next.d.ts
      locale.ts
```

Possible locale resource shape:

```text
src/shared/i18n/locales/
  en/
    common.json
    parties.json
    cards.json
    settings.json
  pl/
    common.json
    parties.json
    cards.json
    settings.json
```

If you prefer fewer files for MVP, start with TS resource objects or one JSON per language and split later.

## Screen-by-screen translation checklist

### Home / party list
`src/app/index.tsx`
- app subtitle
- loading state title/body
- empty state title/body
- create party CTA
- settings entry label/accessibility label if added here

`src/features/parties/components/party-list-item.tsx`
- card count pluralization

### New party
`src/app/party/new.tsx`
- screen title text
- form labels
- validation helper
- placeholder
- save CTA

`src/features/parties/components/party-meta-line.tsx`
- translated theme and mood labels via keys

### Party details
`src/app/party/[partyId].tsx`
- loading title/body
- missing title/body
- create card CTA
- delete party CTA

`src/features/cards/components/party-card-list-section.tsx`
- section title
- empty message

### New character card
`src/app/party/[partyId]/card/new.tsx`
- missing title/body
- screen title
- theme subtitle labels
- generate/generating CTA

`src/features/cards/components/new-character-card-form.tsx`
- all field labels
- placeholders
- helper text
- translated sex + trait option labels
- inline error rendering

`src/features/cards/hooks/use-new-character-card-form.ts`
- validation and fallback error strings
- pass active language into generation request

### Card details
`src/app/party/[partyId]/card/[cardId].tsx`
- loading title/body
- missing title/body
- accepted/draft status label

`src/features/cards/components/card-details-actions.tsx`
- accept CTA
- regenerate/regenerating CTA
- delete CTA

`src/features/cards/components/card-display-mode-switch.tsx`
- display mode option labels

`src/features/cards/components/card-history-section.tsx`
- section title

`src/features/cards/components/card-traits-section.tsx`
- section title

`src/features/cards/components/card-special-movement-section.tsx`
- section title

`src/features/cards/components/card-special-phrase-section.tsx`
- section title

`src/features/cards/components/character-card-list-item.tsx`
- accepted/draft status label

`src/features/cards/hooks/use-card-details-actions.ts`
- delete alert title/body/actions
- regenerate alert title/body/actions
- regeneration fallback error string
- pass active language into regeneration request

### Settings
New route: `src/app/settings.tsx`
- screen title
- section title
- helper copy about system language
- option labels: System default / English / Polish
- optional current effective language label

### Layout/nav
`src/app/_layout.tsx`
- all stack titles
- add settings title

### Secondary screen
`src/app/explore.tsx`
- translate only if this route remains reachable/kept

## Implementation task breakdown

These tasks are intentionally small so they can later be assigned to subagents with minimal overlap.

### Task 1 — install and configure i18n dependencies
- install `i18next`, `react-i18next`, and `expo-localization`
- add or verify Expo localization plugin configuration if required by the current app config
- confirm dependency versions are compatible with the current Expo SDK

### Task 2 — create i18n bootstrap module
- add `src/shared/i18n/index.ts`
- initialize `i18next` with `initReactI18next`
- configure `fallbackLng: 'en'`
- configure `interpolation.escapeValue = false`
- set `defaultNS` and `returnNull: false` if used

### Task 3 — create locale resources structure
- add the initial locale file structure under `src/shared/i18n/`
- create the English source locale files
- create placeholder Polish locale files or empty mirrored structure
- choose whether the MVP uses JSON files or TS resource objects

### Task 4 — add TypeScript typing for translations
- add `src/shared/i18n/i18next.d.ts`
- type translation resources from the English source files
- ensure `useTranslation()` gets typed key support where practical

### Task 5 — add locale resolution helpers
- add helper utilities for supported-language matching
- resolve device locale into `'en' | 'pl'`
- keep `'system'` handling separate from resolved language
- default unsupported locales to English

### Task 6 — extend preferences store for language selection
- update `src/features/preferences/types.ts`
- update `src/features/preferences/store/preferences-store.ts`
- add `languagePreference: 'system' | 'en' | 'pl'`
- add setter action and persistence

### Task 7 — add root language-sync hook
- add a hook such as `src/shared/i18n/use-app-language.ts`
- read `languagePreference` from the preferences store
- use Expo locale data, preferably via `useLocales()`
- call `i18n.changeLanguage()` when the resolved language changes

### Task 8 — wire i18n into the root layout
- import the i18n bootstrap in `src/app/_layout.tsx`
- run the root language-sync hook there
- ensure layout rerenders when language changes
- decide whether explicit `I18nextProvider` wrapping is needed

### Task 9 — translate stack titles and add settings route registration
- translate all current stack titles in `src/app/_layout.tsx`
- add the new `/settings` route title
- confirm titles react correctly to runtime language switching

### Task 10 — add settings entry point from the home screen
- add a header-right button or similar entry point on `src/app/index.tsx`
- use translated label and accessibility text
- route to `/settings`

### Task 11 — build the settings screen UI
- add `src/app/settings.tsx`
- render the App language section
- show `System default`, `English`, and `Polish`
- apply changes immediately when the user selects an option
- show helper text for effective language when preference is `system`

### Task 12 — translate the home screen and party list empty states
- update `src/app/index.tsx`
- translate hero copy, loading state, empty state, and CTA
- keep the screen focused on the main flow

### Task 13 — translate new party screen copy
- update `src/app/party/new.tsx`
- translate title, labels, validation helper, placeholder, and submit CTA

### Task 14 — translate party details screen copy
- update `src/app/party/[partyId].tsx`
- translate loading state, missing state, create-card CTA, and delete-party CTA

### Task 15 — translate new character card screen copy
- update `src/app/party/[partyId]/card/new.tsx`
- translate missing state, screen title, subtitle labels, and generate button states

### Task 16 — translate card details screen copy
- update `src/app/party/[partyId]/card/[cardId].tsx`
- translate loading state, missing state, and status labels

### Task 17 — translate party and card list item components
- update `src/features/parties/components/party-list-item.tsx`
- update `src/features/cards/components/character-card-list-item.tsx`
- translate status labels and count labels
- replace manual singular/plural logic with i18next pluralization

### Task 18 — translate party meta and option-driven labels
- update `src/features/parties/components/party-meta-line.tsx`
- replace English label map usage with translation keys
- keep stored enum values unchanged

### Task 19 — translate new character card form component
- update `src/features/cards/components/new-character-card-form.tsx`
- translate labels, placeholders, helper text, and visible inline errors
- replace sex and trait option label maps with translations

### Task 20 — translate card sections and display mode switch
- update:
  - `src/features/cards/components/card-display-mode-switch.tsx`
  - `src/features/cards/components/card-history-section.tsx`
  - `src/features/cards/components/card-traits-section.tsx`
  - `src/features/cards/components/card-special-movement-section.tsx`
  - `src/features/cards/components/card-special-phrase-section.tsx`
  - `src/features/cards/components/party-card-list-section.tsx`
- translate all section and mode labels

### Task 21 — translate alerts and validation errors in hooks
- update:
  - `src/features/parties/hooks/use-party-details-actions.ts`
  - `src/features/cards/hooks/use-new-character-card-form.ts`
  - `src/features/cards/hooks/use-card-details-actions.ts`
- translate alert titles, bodies, actions, and fallback error messages
- decide whether to keep localized strings in state or switch to error keys

### Task 22 — phase out English option label maps from UI usage
- audit remaining usages of:
  - `themeCategoryLabels`
  - `partyMoodLabels`
  - `cardTraitLabels`
  - `sexOptionLabels`
- replace UI usage with translation keys or helper functions
- keep enum arrays as the source of truth for values

### Task 23 — add AI generation language support to request types
- update generation request types to carry resolved language
- add something like `outputLanguage: 'en' | 'pl'`
- thread that value through new-card and regenerate flows

### Task 24 — update AI prompt builder for localized output
- update `src/features/generation/prompt.ts`
- add explicit instruction to return field values in the current app language
- keep schema keys unchanged
- localize prompt-injected metadata labels such as theme, mood, sex, and traits

### Task 25 — update generator integration to pass language through
- update `src/features/generation/gemini.ts` and callers if needed
- ensure both initial generation and regeneration pass the resolved language
- preserve current validation and JSON parsing behavior

### Task 26 — translate or retire secondary screen copy
- update `src/app/explore.tsx` if the screen is still kept
- otherwise document that it is intentionally out of scope or candidate for removal

### Task 27 — smoke test language switching behavior
- verify stack titles update after language change
- verify settings persistence after app restart
- verify `system` preference follows device locale where supported
- verify party/card counts pluralize correctly
- verify existing generated cards remain unchanged when app language changes

### Task 28 — prepare Polish translations from the English source locale
- use the finalized English locale files as the source of truth
- fill the Polish locale files with translated values for all current keys
- keep key structure identical to English
- flag any ambiguous wording that needs product review

## Risks / caveats

- **Existing cards are immutable content**: changing app language should not rewrite previously generated card text.
- **Hook-localized error strings**: if translated at set-time, switching language while an error is visible may leave that error in the old language until the next action.
- **Navigation title updates**: ensure layout actually rerenders when language changes.
- **Prompt quality in Polish**: generated output may vary in style/quality; we should smoke-test both English and Polish after implementation.
- **Constants refactor scope**: removing English label maps completely may touch more files than simply phasing out their usage. Prefer phased usage replacement first.

## Proposed initial locales

For MVP, start with:
- English (`en`)
- Polish (`pl`)

This matches your request and keeps prompt instructions straightforward.

## Recommendation summary

Implement internationalization with:
- `react-i18next` + `i18next`
- `expo-localization`
- persisted `languagePreference` in the preferences store
- a dedicated `/settings` screen with inline language choices
- a locale-aware root sync hook, preferably based on Expo locale hooks
- translated UI strings and pluralization across all current screens
- AI prompt instruction + metadata labels aligned to the current resolved language

This gives LarParty a modern multilingual foundation without overbuilding the MVP.
