# LarParty PoC — Build Checklist

This checklist translates the approved implementation plan into practical execution steps.

---

## Phase 0 — Validation and setup

- [ ] Re-run Context7 validation for:
  - [ ] Expo guidance
  - [ ] React Native guidance
  - [ ] local LLM feasibility in Expo
  - [ ] persistence/storage package guidance
- [ ] Confirm package choices after doc validation
- [ ] Confirm whether local LLM requires native-only fallback or web fallback behavior
- [ ] Freeze any remaining package-level decisions before coding

---

## Phase 1 — App shell and routing

### Goal
Replace the Expo starter shell with the LarParty app structure.

### Tasks
- [ ] Remove starter/demo screen concepts and app copy
- [ ] Replace tab-based starter navigation with stack-based app flow
- [ ] Create route structure:
  - [ ] `/`
  - [ ] `/party/new`
  - [ ] `/party/[partyId]`
  - [ ] `/party/[partyId]/card/new`
  - [ ] `/party/[partyId]/card/[cardId]`
- [ ] Simplify the root layout for app-specific navigation
- [ ] Remove dark-mode-dependent logic from the current starter theme flow
- [ ] Keep light-mode-only app setup
- [ ] Keep phone-first layout assumptions
- [ ] Add app-level empty placeholder screens for each main route

### Exit criteria
- [ ] App launches into Party List Screen
- [ ] All main routes exist and are navigable
- [ ] No starter-tab UX remains

---

## Phase 2 — Domain model and constants

### Goal
Create stable product primitives before screen logic grows.

### Tasks
- [ ] Add shared app constants for:
  - [ ] theme categories
  - [ ] moods
  - [ ] traits
  - [ ] sex options
  - [ ] card display modes
- [ ] Add domain types for:
  - [ ] `Party`
  - [ ] `CharacterCardInput`
  - [ ] `CharacterCardGenerated`
  - [ ] `CharacterCard`
  - [ ] generation request types
- [ ] Add status types:
  - [ ] `draft`
  - [ ] `accepted`
- [ ] Add generation linkage fields:
  - [ ] `generationGroupId`
  - [ ] `basedOnCardId`
- [ ] Add selector/helper utilities for:
  - [ ] filtering cards by party
  - [ ] filtering drafts vs accepted
  - [ ] formatting labels for display

### Exit criteria
- [ ] All frozen enums live in one predictable place
- [ ] Screens can import types/constants without duplication

---

## Phase 3 — Persistence foundation

### Goal
Make parties, cards, and preferences persist locally.

### Tasks
- [ ] Create a storage abstraction for app data
- [ ] Add persistence support for:
  - [ ] parties collection
  - [ ] cards collection
  - [ ] card display mode preference
- [ ] Implement hydration flow on app startup
- [ ] Implement create/read/update/delete helpers for parties
- [ ] Implement create/read/update/delete helpers for cards
- [ ] Implement cascade delete from party -> cards
- [ ] Add safe empty-state fallback for missing persisted data
- [ ] Add error handling strategy for corrupted or missing local data

### Exit criteria
- [ ] Data survives app reload/restart
- [ ] Party deletion removes related cards
- [ ] UI preference can be restored

---

## Phase 4 — Party screens

### Goal
Build the party-level UX before AI card generation.

### Tasks
- [ ] Implement Party List Screen
- [ ] Add empty state for no parties
- [ ] Add create party CTA
- [ ] Add delete party action with confirmation
- [ ] Implement Create Party Screen
- [ ] Add required field validation:
  - [ ] title
  - [ ] theme category
  - [ ] mood
- [ ] On save, persist party and navigate to party details
- [ ] Implement Party Details Screen
- [ ] Show party metadata:
  - [ ] title
  - [ ] theme category
  - [ ] mood
- [ ] Show card list for selected party
- [ ] Add empty state for no cards
- [ ] Add create card CTA

### Exit criteria
- [ ] User can create and delete parties
- [ ] Party details render persisted data correctly
- [ ] Party list updates immediately after changes

---

## Phase 5 — Card creation foundation

### Goal
Build card input flow before real AI generation.

### Tasks
- [ ] Implement Create Character Card Screen
- [ ] Add form fields:
  - [ ] name
  - [ ] sex
  - [ ] age
  - [ ] traits
- [ ] Enforce max 3 traits
- [ ] Add required validation for all fields
- [ ] Add generation CTA
- [ ] Add temporary loading state UX
- [ ] Add placeholder/mock generation path if needed during integration setup
- [ ] Create local card record shape ready for generated output

### Exit criteria
- [ ] Form is functional and validated
- [ ] User can reach generate flow from party details
- [ ] Inputs map cleanly into generation request structure

---

## Phase 6 — AI generation integration

### Goal
Connect form input to local-LLM-first character generation.

### Tasks
- [ ] Create generation service interface
- [ ] Add local LLM generator implementation
- [ ] Add optional mock generator fallback for development
- [ ] Create prompt builder
- [ ] Create AI response schema validator
- [ ] Add generation request mapper from Party + CharacterCardInput
- [ ] Implement successful generation flow:
  - [ ] validate input
  - [ ] build prompt
  - [ ] call generator
  - [ ] validate response
  - [ ] create draft card
  - [ ] persist locally
  - [ ] navigate to card details
- [ ] Implement failure handling for:
  - [ ] generation failure
  - [ ] malformed JSON
  - [ ] invalid schema
  - [ ] unavailable AI runtime

### Exit criteria
- [ ] Successful generation produces a saved draft card
- [ ] Invalid responses do not create broken saved data
- [ ] UX shows meaningful error feedback

---

## Phase 7 — Card details and lifecycle actions

### Goal
Make generated cards usable and manageable.

### Tasks
- [ ] Implement Card Details Screen
- [ ] Show:
  - [ ] generated name with class
  - [ ] background history
  - [ ] 3 traits
  - [ ] special movement
  - [ ] special phrase
  - [ ] draft/accepted status
- [ ] Implement accept action
- [ ] Implement delete card action with confirmation
- [ ] Implement regenerate action with confirmation
- [ ] Implement regenerate-as-new-draft behavior
- [ ] Preserve previously accepted versions
- [ ] Link regenerated drafts using:
  - [ ] `generationGroupId`
  - [ ] `basedOnCardId`
- [ ] Make draft vs accepted visually distinguishable

### Exit criteria
- [ ] Draft can be accepted
- [ ] Accepted card stays preserved when regeneration creates a new draft
- [ ] Card deletion works and updates party screen

---

## Phase 8 — Card presentation modes

### Goal
Support both decorative and readable card views.

### Tasks
- [ ] Design collectible card mode component
- [ ] Design info mode component
- [ ] Add display mode toggle UI
- [ ] Persist selected display mode locally
- [ ] Reuse generated data consistently in both layouts
- [ ] Ensure both modes remain readable on phone screens

### Exit criteria
- [ ] User can switch between collectible and info view
- [ ] Selected mode is restored after app restart

---

## Phase 9 — Theme styling system

### Goal
Introduce theme-specific visual flavor without overcomplicating the UI.

### Tasks
- [ ] Add base app design tokens
- [ ] Add theme accent packs for:
  - [ ] Fantasy
  - [ ] Sci-Fi
  - [ ] Horror
  - [ ] StarWars
  - [ ] Harry Potter
  - [ ] Witcher
- [ ] Apply theme accents to:
  - [ ] party list items
  - [ ] party details header
  - [ ] card details frame/accent areas
- [ ] Keep layout structure shared across themes
- [ ] Avoid separate per-theme component trees

### Exit criteria
- [ ] Theme category visibly affects styling
- [ ] UI remains consistent and manageable

---

## Phase 10 — Web compatibility pass

### Goal
Ensure the mobile-first MVP still works acceptably on web.

### Tasks
- [ ] Test all routes on web
- [ ] Test all forms on web
- [ ] Test persistence behavior on web
- [ ] Verify display mode toggle works on web
- [ ] Verify layout remains usable at common browser widths
- [ ] Add only minimal web-specific adjustments if needed

### Exit criteria
- [ ] Core product flow works on web
- [ ] No web-only work blocks mobile-first delivery

---

## Phase 11 — Final polish and readiness

### Goal
Bring the PoC to a demo-ready state.

### Tasks
- [ ] Review loading, error, and empty states across all screens
- [ ] Review delete/regenerate confirmation UX
- [ ] Review consistency of labels and enum display text
- [ ] Review theme coherence per category
- [ ] Review navigation back behavior
- [ ] Review persisted data behavior after repeated regen/delete flows
- [ ] Test draft/accepted lifecycle thoroughly
- [ ] Prepare short demo flow for showcasing the PoC

### Exit criteria
- [ ] Main MVP flow is stable
- [ ] Draft/accepted/regeneration behavior is understandable
- [ ] App is visually coherent enough for PoC presentation
