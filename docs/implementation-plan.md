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
  | 'starwars'
  | 'harry-potter'
  | 'witcher';

export type PartyMood =
  | 'fun'
  | 'serious'
  | 'scary'
  | 'silly'
  | 'dramatic'
  | 'chaotic'
  | 'mysterious'
  | 'adventurous';

export type InputTrait =
  | 'calm'
  | 'aggressive'
  | 'funny'
  | 'mysterious'
  | 'loyal'
  | 'shy'
  | 'arrogant'
  | 'chaotic';

export type SexOption = 'male' | 'female' | 'other';
export type CardStatus = 'draft' | 'accepted';
export type CardDisplayMode = 'collectible' | 'info';
```

## 6.2 Party model

```ts
export interface Party {
  id: string;
  title: string;
  themeCategory: ThemeCategory;
  mood: PartyMood;
  createdAt: string;
  updatedAt: string;
}
```

## 6.3 Card input model

```ts
export interface CharacterCardInput {
  name: string;
  sex: SexOption;
  age: number;
  selectedTraits: InputTrait[];
}
```

## 6.4 Generated output model

```ts
export interface CharacterCardGenerated {
  generatedNameWithClass: string;
  backgroundHistory: string;
  characterTraits: [string, string, string];
  specialMovement: string;
  specialPhrase: string;
}
```

## 6.5 Card model

```ts
export interface CharacterCard {
  id: string;
  partyId: string;
  status: CardStatus;
  input: CharacterCardInput;
  generated: CharacterCardGenerated;
  generationGroupId: string;
  basedOnCardId?: string;
  createdAt: string;
  updatedAt: string;
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
  party: Party;
  input: CharacterCardInput;
}

export interface CharacterGenerator {
  generate(request: GenerateCharacterCardRequest): Promise<CharacterCardGenerated>;
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
