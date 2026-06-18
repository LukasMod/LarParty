# LarParty PoC — Implementation Plan

## 1. Planning Status

This implementation plan is based on:

- the current repository structure
- the approved MVP decisions
- product clarifications gathered during discovery

A follow-up documentation validation pass with Context7 is still required for:

- Expo-specific package guidance
- React Native-specific package guidance
- local LLM feasibility details in Expo

Because shell-based Context7 access was unavailable during planning, this document should be treated as the approved implementation direction pending final framework-doc validation.

---

## 2. Current Project Baseline

The current project is a near-default Expo Router starter.

### Observed repo state

- App entry uses `expo-router/entry`
- Routes live under `src/app`
- Current navigation is starter-style tab navigation
- Current theme setup still includes light/dark behavior
- There is no domain model, persistence layer, AI layer, or app-specific screen structure yet

### Planning conclusion

The best implementation path is to replace the starter shell with a clean app structure rather than adapting the sample tabs and demo content.

---

## 3. MVP Decisions Frozen for Implementation

## 3.1 Product rules

- Party and Party Theme are the same entity
- Party is only a grouping container for cards
- Party title is user-facing only and does not affect prompt context
- No auth
- No backend
- No notifications
- No payments
- No maps, location, camera, or media
- Light mode only
- Phone-first layout
- Web is a secondary nice-to-have target

## 3.2 Frozen enums

### Theme categories

- Fantasy
- Sci-Fi
- Horror
- StarWars
- Harry Potter
- Witcher

### Mood categories

- fun
- serious
- scary
- silly
- dramatic
- chaotic
- mysterious
- adventurous

### Traits

- calm
- aggressive
- funny
- mysterious
- loyal
- shy
- arrogant
- chaotic

### Sex field options

- Male
- Female
- Other

## 3.3 Card generation rules

- Trait selection max: 3
- AI response format: strict structured JSON
- Generated result auto-saves as draft
- User can accept a draft
- User can regenerate a card
- Delete and regenerate actions both require confirmation
- No demo seed data on first launch

## 3.4 Regeneration model

If a user regenerates after accepting a card:

- the accepted card stays saved
- regeneration creates a new draft candidate
- user can compare and choose between versions later

This means regeneration should create a new card record rather than overwriting an accepted card in place.

---

## 4. Recommended App Architecture

Use a **small feature-first architecture** built around Expo Router screens plus shared feature modules.

## 4.1 Folder structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    party/
      new.tsx
      [partyId].tsx
      [partyId]/card/
        new.tsx
        [cardId].tsx
  features/
    parties/
      components/
      hooks/
      storage/
      constants/
      types.ts
      selectors.ts
    cards/
      components/
      hooks/
      storage/
      constants/
      types.ts
      selectors.ts
    generation/
      prompt/
      services/
      schemas/
      mappers/
      types.ts
  shared/
    components/
    storage/
    theme/
    constants/
    validation/
    utils/
```

## 4.2 Why this structure

- keeps features easy to find
- avoids premature enterprise layering
- keeps AI generation isolated from Party/Card UI flows
- still leaves room for future backend sync or auth later

---

## 5. Navigation Plan

## 5.1 Replace the starter tab flow

The app should not keep the current two-tab starter template.

### Reason

This product is flow-based, not tab-based.

The natural user journey is:

- party list
- create/open party
- create/open card
- accept/regenerate/delete card

## 5.2 Recommended routes

- `/` → Party List Screen
- `/party/new` → Create Party Screen
- `/party/[partyId]` → Party Details Screen
- `/party/[partyId]/card/new` → Create Character Card Screen
- `/party/[partyId]/card/[cardId]` → Card Details Screen

## 5.3 Navigation type

Use a stack-based navigation structure with Expo Router.

---

## 6. Domain Modeling

## 6.1 Shared enums

```ts
export type ThemeCategory =
  | 'fantasy'
  | 'sci-fi'
  | 'horror'
  | 'magic'
  | 'casual'
  | 'corporation'

export type PartyMood =
  | 'fun'
  | 'serious'
  | 'scary'
  | 'silly'
  | 'dramatic'
  | 'chaotic'
  | 'mysterious'
  | 'adventurous'

export type InputTrait =
  | 'calm'
  | 'aggressive'
  | 'funny'
  | 'mysterious'
  | 'loyal'
  | 'shy'
  | 'arrogant'
  | 'chaotic'

export type SexOption = 'male' | 'female' | 'other'
export type CardStatus = 'draft' | 'accepted'
export type CardDisplayMode = 'collectible' | 'info'
```

## 6.2 Party model

```ts
export interface Party {
  id: string
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
  createdAt: string
  updatedAt: string
}
```

## 6.3 Card input model

```ts
export interface CharacterCardInput {
  name: string
  sex: SexOption
  age: number
  selectedTraits: InputTrait[]
}
```

## 6.4 Generated output model

```ts
export interface CharacterCardGenerated {
  generatedNameWithClass: string
  backgroundHistory: string
  characterTraits: [string, string, string]
  specialMovement: string
  specialPhrase: string
}
```

## 6.5 Card model

```ts
export interface CharacterCard {
  id: string
  partyId: string
  status: CardStatus
  input: CharacterCardInput
  generated: CharacterCardGenerated
  generationGroupId: string
  basedOnCardId?: string
  createdAt: string
  updatedAt: string
}
```

## 6.6 Why `generationGroupId`

This supports the product rule that accepted cards are preserved and new regenerations create draft variants.

### Example

- first generation → card A, draft
- user accepts → card A, accepted
- user regenerates → card B, draft, `basedOnCardId = A`, same `generationGroupId`

This keeps version history simple without building a separate versioning engine.

---

## 7. Persistence and Offline Strategy

## 7.1 Persistence goals

The app must persist locally:

- all parties
- all cards
- user UI preference for card display mode

## 7.2 Storage abstraction

Use a single app-level storage interface rather than storage calls scattered through screens.

### Example responsibilities

- load parties
- save parties
- load cards
- save cards
- cascade-delete cards when a party is deleted
- load/save UI preferences

## 7.3 Hydration flow

1. App launches
2. Root layout or app bootstrap hydrates local data
3. Party list renders from persisted state
4. Detail screens filter by route params and hydrated collections

## 7.4 Offline support

### Must work offline

- party list
- party detail screen
- card details screen
- saved drafts
- accepted cards

### Not required offline

- generation
- regeneration
- any local LLM workflow unless confirmed later by implementation feasibility

## 7.5 Deletion behavior

- deleting a party removes the party and all cards linked to it
- deleting a card removes only that card
- all delete actions require confirmation

---

## 8. State Management Plan

## 8.1 Recommendation

Start without a heavy global state library.

Use:

- local component state for forms and transient UI state
- custom hooks for persistent collections and actions

### Suggested hooks

- `useParties()`
- `useParty(partyId)`
- `useCards(partyId)`
- `useCard(cardId)`
- `useCardDisplayMode()`

## 8.2 Why

- data scope is small
- app is single-user and local-first
- avoids Redux-class complexity early

---

## 9. Forms and Validation Plan

## 9.1 Party form

Fields:

- title: required
- theme category: required select
- mood: required select

## 9.2 Character card form

Fields:

- name: required
- sex: required select
- age: required numeric input
- traits: required bounded multi-select, max 3

## 9.3 Validation rules

### Party

- title non-empty
- theme category valid enum
- mood valid enum

### Character input

- name non-empty
- sex valid enum
- age positive reasonable number
- traits length between 1 and 3
- all selected traits valid enum values

## 9.4 AI output validation

Validate runtime output before saving any generated card.

Rules:

- all required fields present
- all required fields non-empty
- exactly 3 returned traits
- background string usable as short 2-sentence content

If validation fails:

- show error state
- do not save invalid generation result

---

## 10. AI Generation Architecture

## 10.1 Main planning direction

Local LLM should be treated as the **primary AI path** for this PoC.

## 10.2 Important caveat

Local LLM integration still requires framework validation later, especially for:

- Expo managed workflow compatibility
- native runtime support
- web fallback expectations
- model packaging and performance constraints

Because of that, the implementation should still isolate generation behind a provider interface.

## 10.3 Generation interface

```ts
export interface GenerateCharacterCardRequest {
  party: Party
  input: CharacterCardInput
}

export interface CharacterGenerator {
  generate(
    request: GenerateCharacterCardRequest,
  ): Promise<CharacterCardGenerated>
}
```

## 10.4 Suggested provider implementations

- `LocalLlmCharacterGenerator` — primary target
- `MockCharacterGenerator` — fallback for development/testing

A hosted provider adapter can be added later if local LLM proves impractical in Expo.

## 10.5 Prompt builder responsibilities

Build prompts from:

- party theme category
- mood
- character name
- sex
- age
- selected traits

Prompt requirements:

- output JSON only
- 2-sentence background
- exactly 3 character traits
- one special movement
- one special phrase
- safe for broad age range
- keep themed but avoid inappropriate content

## 10.6 Generation flow

1. Validate form input
2. Build prompt
3. Run generation through generator service
4. Validate JSON response
5. Create a new draft card record
6. Save locally
7. Navigate to card detail screen

## 10.7 Regeneration flow

1. User taps regenerate
2. Confirmation dialog appears
3. Reuse same party and input data
4. Generate new output
5. Validate response
6. Save new card record as draft
7. Link to previous card via `basedOnCardId`
8. Keep prior accepted version unchanged
9. Navigate to the new draft or refresh the comparison flow

## 10.8 Accept flow

1. User opens a draft
2. User taps accept
3. Card status changes to `accepted`
4. Card remains saved as the chosen version

---

## 11. UI and Theme Strategy

## 11.1 Light mode only

The current starter light/dark theme behavior should be removed or simplified.

## 11.2 Theme system

Use one shared design system with theme accent packs rather than separate skins.

### Base design tokens

- app background
- surface background
- elevated surface
- border
- primary text
- secondary text
- accent
- accent soft
- badge color
- destructive color

### Theme accent packs

Each theme category should define accent tokens for:

- primary accent
- soft accent background
- decorative border/frame
- optional icon or ornament direction

## 11.3 Example theme directions

- Fantasy → parchment, gold, moss, magical flourishes
- Sci-Fi → cool neon, metallic blue, angular accents
- Horror → crimson, shadowed plum, eerie contrast
- StarWars → cinematic space-opera accents
- Harry Potter → whimsical academic magic accents
- Witcher → worn leather, silver, medieval-dark accents

## 11.4 Card detail display modes

### Collectible mode

- dramatic frame
- larger title treatment
- more themed decoration
- visually fun for party use

### Info mode

- simpler layout
- more readable sectioning
- stronger hierarchy for quick scanning

## 11.5 View mode persistence

Store the selected display mode as a UI preference locally.

---

## 12. Screen-by-Screen Technical Plan

## 12.1 Party List Screen

### Purpose

Primary landing screen.

### Content

- all parties
- create button
- empty state

### States

- hydrating
- empty
- populated

### Actions

- create party
- open party
- delete party

### Acceptance criteria

- list persists across app restarts
- empty state appears correctly when no parties exist
- delete requires confirmation

## 12.2 Create Party Screen

### Purpose

Create a party/theme container.

### Inputs

- title
- theme category
- mood

### States

- idle
- invalid
- saving

### Actions

- save
- cancel/back

### Acceptance criteria

- saved party appears in main list
- required validation works

## 12.3 Party Details Screen

### Purpose

Display selected party and its cards.

### Content

- party title
- theme category
- mood
- card list
- create card CTA

### States

- no cards yet
- mixed card statuses

### Actions

- create card
- open card
- delete card
- delete party

### Acceptance criteria

- cards filtered by party
- draft/accepted status visible
- party deletion cascades correctly

## 12.4 Create Character Card Screen

### Purpose

Collect card input and trigger generation.

### Inputs

- name
- sex
- age
- traits up to 3

### States

- idle
- validation error
- generating
- generation error

### Actions

- generate
- cancel/back

### Acceptance criteria

- max 3 traits enforced
- successful generation saves a new draft locally
- user is taken to generated card details after success

## 12.5 Card Details Screen

### Purpose

Display generated card and its current state.

### Content

- generated name with class
- background history
- 3 generated traits
- special movement
- special phrase
- draft/accepted badge
- display mode toggle

### States

- draft
- accepted
- regenerating
- deletion pending

### Actions

- accept draft
- regenerate
- delete
- switch display mode

### Acceptance criteria

- user can accept draft
- regenerate creates a new draft rather than overwriting accepted version
- toggle switches between collectible and info modes
- delete and regenerate require confirmation

---

## 13. Suggested Implementation Order

## Phase 1 — App shell

- replace starter tab navigation
- create stack route layout
- simplify to light-only theme setup
- define constants, enums, and domain types

## Phase 2 — Party CRUD foundation

- implement local persistence abstraction
- implement create/list/delete party
- implement empty/loading states

## Phase 3 — Card CRUD foundation

- implement create card form
- validate input
- add card list/detail structure
- implement delete card
- add display-mode preference storage

## Phase 4 — AI generation integration

- implement local LLM generator boundary
- implement prompt builder
- implement runtime response validation
- create draft card on successful generation
- implement accept flow
- implement regenerate-as-new-draft flow

## Phase 5 — Visual system and card modes

- theme accent packs
- collectible mode
- info mode
- polish spacing, cards, badges, headers

## Phase 6 — Web pass

- verify routing
- verify form interaction
- verify local persistence behavior
- apply minimal compatibility fixes only if needed

---

## 14. Risks and Constraints

## 14.1 Local LLM risk

This is the highest technical uncertainty.

Questions that still need validation:

- how well the chosen local LLM path works in Expo-managed apps
- whether it supports both iOS and Android acceptably
- what web support looks like
- expected model size/performance tradeoffs

## 14.2 Structured JSON reliability

Even local or hosted models may produce malformed output.
Runtime validation remains required.

## 14.3 Web storage/platform differences

Web is secondary, so local persistence on web should be treated as supportable but not the main product priority.

## 14.4 Theme complexity risk

Theme flavor should be expressed through tokenized accents, not radically different layouts, to keep the MVP manageable.

---

## 15. Required Follow-Up After Context7 Becomes Available

Before starting final implementation, validate with Context7:

- current Expo navigation and storage best-practice guidance for the installed Expo generation
- current React Native compatibility guidance for chosen packages
- local LLM integration viability and constraints for Expo
- web caveats for the selected persistence and AI approach

---

## 16. Unistyles 3 Per-Party Theming Plan

### 16.1 Current baseline

The current app is already structurally compatible with a Unistyles migration, but it is not yet configured for it.

Observed state:

- project uses `react` 19.2.3 and `react-native` 0.85.3
- required native dependencies for Unistyles 3 are already present: `react-native-reanimated` and `react-native-nitro-modules`
- `react-native-unistyles` has been added as a dependency
- Expo New Architecture is not yet enabled
- there is currently no `babel.config.js`
- the app still uses a static light theme via local constants and helper wrappers

### 16.2 Product decisions for theming

The theming direction for this app is now frozen as follows:

- use **full palette** theming, not accent-only theming
- party styling is driven by **theme category only**, not mood
- the theme should affect the **whole app while inside a party flow**, including header chrome
- party visual theme is **fixed at creation time** for MVP
- category palettes should be **bold**, not subtle
- home list should show **party theme previews** without recoloring the whole home screen
- typography stays shared for MVP, with room for future category-specific personality
- the current warm beige palette remains the default non-party theme

### 16.3 Recommended theming architecture

Adopt Unistyles 3 as the styling foundation and switch themes at runtime based on the currently active party route.

Use one default app theme for non-party screens and one theme per party category for in-party screens.

This keeps the MVP simple because visual styling can be derived directly from `party.themeCategory` without storing duplicate per-party palette data.

### 16.4 Theme modeling strategy

Map each `ThemeCategory` to one Unistyles theme name:

- `default`
- `party-fantasy`
- `party-sci-fi`
- `party-horror`
- `party-magic`
- `party-casual`
- `party-corporation`

This design:

- preserves the fixed-at-creation rule without adding editable visual state
- makes runtime switching deterministic
- avoids saving redundant palette data on every party record
- keeps future custom overrides possible if needed later

### 16.5 Theme system structure

Create a dedicated theme layer under `src/shared/theme/`:

- `tokens.ts` for shared spacing, radius, and typography primitives
- `themes.ts` for concrete Unistyles themes
- `unistyles.ts` for `StyleSheet.configure(...)`
- `party-theme.ts` for mapping `ThemeCategory` to Unistyles theme names
- module augmentation for `react-native-unistyles` typing

Theme objects should include:

- `colors.text`
- `colors.textSecondary`
- `colors.background`
- `colors.surface` / `backgroundElement`
- `colors.selectedSurface`
- `colors.border`
- `colors.primary`
- `colors.primaryText`
- `colors.danger`
- `colors.dangerText`
- `colors.inputBackground`
- `colors.inputBorder`
- `colors.headerBackground`
- `colors.cardPreviewAccent`
- shared spacing tokens
- shared radius tokens
- shared fonts / typography references
- optional theme metadata for future visual personality extensions

### 16.6 Palette art direction

Because the visual direction is intentionally bold, each category theme should be strong but still readable.

Initial palette guidance:

- default → warm parchment / beige baseline
- fantasy → jewel-toned plum + antique gold + parchment contrast
- sci-fi → deep navy / graphite + neon cyan accent
- horror → dark wine / charcoal + blood-red accent
- magic → enchanted violet / midnight blue + bright arcane accent
- casual → soft cream / denim + playful warm accent
- corporation → cool slate / white + crisp electric blue accent

### 16.7 Runtime theme switching strategy

Runtime theme switching should happen high in the route tree so it can affect:

- header tint and header background
- screen background
- shared surfaces
- buttons, inputs, chips, and other repeated UI

Recommended flow:

1. detect whether the active route contains a `partyId`
2. read the matching party from persisted state
3. resolve the theme name from `party.themeCategory`
4. call `UnistylesRuntime.setTheme(themeName)` for party flows
5. fall back to `default` on non-party screens such as `/` and `/party/new`

This logic should live close to `src/app/_layout.tsx` rather than being passed manually through props.

### 16.8 Shared helper migration strategy

Keep the current wrapper components, but migrate their internals to Unistyles-backed tokens and theme values:

- `src/components/themed-text.tsx`
- `src/components/themed-view.tsx`
- `src/shared/components/screen.tsx`
- `src/hooks/use-theme.ts`

This reduces migration noise and keeps the screen code readable while the styling engine changes underneath.

### 16.9 Navigation chrome plan

The current root stack layout hardcodes colors from the old static theme.

After the Unistyles migration, stack configuration should derive from the active Unistyles theme so that:

- `headerTintColor`
- `headerStyle.backgroundColor`
- `headerTitleStyle.color`
- `contentStyle.backgroundColor`

all reflect the active default or party theme.

Header chrome should be fully themed while inside party flows.

### 16.10 Home-screen preview behavior

The home screen should remain on the default palette overall, but each party card should preview its category theme.

Recommended preview surfaces:

- accent border
- accent strip
- category badge background
- selected chip colors when appropriate

This gives users visual identity cues without making the whole list screen visually chaotic.

### 16.11 File migration order

Use a staged migration instead of a big-bang rewrite.

#### Pass A — infrastructure and shared primitives

- configure Unistyles
- migrate shared tokens
- migrate `ThemedText`
- migrate `ThemedView`
- migrate `Screen`
- migrate root stack theming in `_layout.tsx`
- add home list preview accents

#### Pass B — party flow screens

Prioritize screens where themed context matters most:

- party details screen
- new character card screen
- character card details screen

#### Pass C — remaining default-flow screens

- new party screen
- home screen cleanup if still needed
- remaining shared/ui components

### 16.12 Data model impact

No party schema change is required for the MVP.

The existing `themeCategory` field is sufficient to derive runtime styling.

Possible future extensions:

- `visualThemeOverride`
- `paletteVariant`
- category-specific typography metadata

### 16.13 Concrete implementation order

1. ensure `react-native-unistyles` is installed
2. enable Expo New Architecture in `app.json`
3. add `babel.config.js` with:
   - `babel-preset-expo`
   - `react-native-unistyles/plugin`
   - `react-native-reanimated/plugin`
4. create typed Unistyles theme configuration
5. call `StyleSheet.configure(...)` before any Unistyles styles are created
6. refactor current constants into shared token/theme modules
7. add route-aware theme synchronization in root layout
8. migrate wrapper components to Unistyles
9. add home-screen preview accents
10. migrate party-flow screens to Unistyles `StyleSheet`
11. migrate remaining screens
12. run lint and boot verification

### 16.14 Important implementation constraints

- every migrated stylesheet file must import `StyleSheet` from `react-native-unistyles`, not `react-native`
- do not re-export `StyleSheet` from barrel files
- use array style composition instead of object spreading
- `StyleSheet.configure(...)` must run before any `StyleSheet.create(...)` that relies on Unistyles
- Expo New Architecture must be enabled before expecting Unistyles 3 to work
- native rebuilds should be expected after configuration changes
- deleted or not-yet-hydrated party routes must fall back cleanly so the wrong theme does not stay active

### 16.15 Validation checklist

- app boots after Babel and native config changes
- default screens remain on the warm baseline palette
- entering a party route switches the full palette consistently
- leaving a party route resets back to default theme
- party list previews show theme identity without recoloring the entire home screen
- missing/deleted party routes fall back safely
- lint passes after migration
