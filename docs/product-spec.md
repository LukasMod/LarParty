# LarParty PoC — Product Specification

Product scope, user flows, and screen intent. Domain rules live in
[`mvp-decisions.md`](./mvp-decisions.md); how the code is built lives in
[`architecture.md`](./architecture.md); open questions live in
[`discovery-questions.md`](./discovery-questions.md).

## 1. Overview

LarParty is a React Native Expo proof-of-concept app for people who enjoy LARP and themed parties. The app helps a user create a party theme and generate AI-powered character cards for party members.

The goal of the PoC is to validate a simple but compelling flow:

1. Create a party/theme
2. Generate one or more character cards from short form input
3. Save cards locally
4. Browse saved parties and cards later, including offline

The app should feel playful and immersive, with the visual style adapting to the selected party theme while staying within one light-mode-only design system.

## 2. Target Users

- All ages, primarily 12–46 years old
- People who enjoy LARP, role-play, cosplay-adjacent experiences, and themed parties
- Users who want to make parties more interactive without a complicated setup process

## 3. Product Goal

The main product goal is to prove that AI-assisted role card generation can make party preparation faster and more fun.

The core value proposition is:

> A user can create a themed party and generate multiple ready-to-use role cards for participants using only a few form inputs.

## 4. MVP Scope

### Must-have

- Create, view, and delete parties
- Treat Party and Party Theme as the same entity
- Generate character cards using AI from form input
- Auto-save generated cards as draft
- Accept generated cards after review
- Regenerate the full card
- View card details
- Delete cards
- Persist parties and cards locally
- Support offline viewing of saved parties and cards
- Support iOS and Android as primary platforms
- Keep web support as nice-to-have if Expo support is clean

### Out of scope for PoC

- Authentication
- Backend/database
- Notifications
- Payments/subscriptions
- Maps/location/camera/media
- Multi-user collaboration
- Advanced editing of generated card fields
- Dark mode

## 5. Core Concepts

### Party

Party is the main container entity. In this app, Party and Party Theme are the same thing.

A party groups all character cards created under a specific theme/mood setup.

#### Party fields

- `id`
- `title`
- `themeCategory`
- `mood`
- `createdAt`
- `updatedAt`

#### Party notes

- Title is only a user-facing name
- Title does not change the AI party context prompt
- No date, description, or location in MVP

### Character Card

A character card is an AI-generated role profile associated with one party.

#### Character card input fields

- `partyId`
- `name`
- `sex`
- `age`
- `selectedTraits`

#### Character card generated fields

- `generatedNameWithClass`
- `backgroundHistory` (2 sentences)
- `characterTraits` (3 items)
- `specialMovement`
- `specialPhrase`

#### Character card metadata fields

- `id`
- `status` (`draft` | `accepted`)
- `createdAt`
- `updatedAt`

## 6. Main User Flows

### Flow A — Create party

1. User opens app
2. User sees list of all saved parties
3. User taps create new party
4. User fills a short form:
   - title
   - theme category
   - mood
5. User saves the party
6. User is redirected to the party details screen

### Flow B — Generate character card

1. User opens a party
2. User taps create card
3. User fills card input form:
   - name
   - sex
   - age
   - predefined traits
4. App builds a structured AI prompt using:
   - party theme category
   - party mood
   - card input form values
5. App calls AI directly from client for PoC
6. App stores returned card as draft automatically
7. User sees generated result
8. User can:
   - accept card
   - regenerate full card
   - delete card

### Flow C — Browse saved content offline

1. User opens app without connectivity
2. User can still browse:
   - party list
   - party details
   - saved cards
   - accepted cards
   - drafted cards already stored locally
3. AI generation and regeneration are unavailable — they always call a remote provider. The
   user can still create a party and fill the character form offline; only the generate call
   fails. See [`mvp-decisions.md`](./mvp-decisions.md).

## 7. Screens

### 7.1 Party List Screen

Purpose: main entry screen with all parties.

#### Content

- list of parties, newest first
- per-party card count
- create new party CTA
- settings entry point in the header
- empty state if no parties exist

#### Actions

- open party
- create party
- delete party

### 7.2 Party Screen

Purpose: show one party and all cards belonging to it.

#### Content

- party name/title
- theme category and mood
- list of cards, drafts and accepted together, most recently updated first
- create card CTA

#### Actions

- open card details
- create card
- delete card
- delete party

### 7.3 Card Details Screen

Purpose: show generated character card in detail.

#### Content

- generated name with class/archetype
- 2-sentence background
- 3 traits
- special movement
- special phrase
- status badge (draft/accepted)

#### Display mode requirement

The card supports two display variants:

- stylized collectible-card presentation
- readable info-sheet presentation

A local UI switch/toggle changes between the two views. See
[`discovery-questions.md`](./discovery-questions.md) for the current gap in this feature.

#### Actions

- accept card
- regenerate card
- delete card

### 7.4 Party Creation Screen

Purpose: create a party/theme.

#### Inputs

- title
- theme category (select)
- mood (select)

### 7.5 Character Card Creation Screen

Purpose: create a new character seed for AI generation.

#### Inputs

- name
- sex
- age
- predefined traits (multi-select or bounded selection)

## 8. AI Generation Requirements

## 8.1 AI integration approach

Real API integration with a direct client-side call and no backend. Provider is Google Gemini
(`gemini-3.5-flash-lite`), isolated behind the `CharacterCardGenerator` interface in
`src/features/generation/` so a later backend swap stays contained. Key is
`EXPO_PUBLIC_GEMINI_API_KEY`. See [`architecture.md`](./architecture.md).

## 8.2 Response format

The app should require strict structured JSON from the AI output and map that into the UI.

### Required output schema

- `generatedNameWithClass`: string
- `backgroundHistory`: string
- `characterTraits`: string[] with exactly 3 items
- `specialMovement`: string
- `specialPhrase`: string

## 8.3 Generation behavior

- Initial generation auto-saves a draft
- User may accept the draft
- User may regenerate the full card
- Regeneration replaces the generated fields while preserving original input fields

## 8.4 Prompting constraints

The prompt should use:

- selected party theme category
- selected mood
- user name
- user sex
- user age
- selected user traits

The prompt should aim for:

- party-friendly tone
- short and readable output
- no explicit/inappropriate content
- clear output consistency
- theme-aware flavor

Theme categories are original labels rather than franchise names. The prompt instructs the
model to draw on the theme for inspiration while avoiding exact canon characters, factions,
and plotlines, so themed output does not reproduce protected material.

## 9. Data and Persistence Requirements

## 9.1 Persistence goals

The app must store enough data locally so that users can access saved parties and cards offline.

## 9.2 Offline requirements

### Must work offline

- Viewing party list
- Viewing party details
- Viewing saved card details
- Viewing accepted and draft cards already stored locally

### Does not need to work offline

- AI generation
- AI regeneration

Generation and regeneration are network-bound by design: they call a hosted provider and
cannot run offline. Party creation and the character form work offline; only the generate
call needs a connection.

## 10. UX and Visual Direction

## 10.1 Visual style

- Party Crazy overall tone
- Mixed style depending on selected party theme
- Light mode only for PoC
- Phone-first layout
- Web supported secondarily when practical

## 10.2 Theming direction

The app should use one core design system, but visual accents should adapt to theme category.

Examples:

- Fantasy: violet primary, mint accent
- Sci-Fi: cyan primary, lime accent
- Horror: red primary, olive accent
- Wizard-school-inspired: whimsical academic accents

## 10.3 Styling technology

- Unistyles 3.0

## 11. Platform Priorities

### Primary

- iOS
- Android

### Secondary

- Web as nice-to-have

### Layout priority

- Optimize for phone layout first
- Tablet/web adaptation can remain minimal in PoC

## 12. Functional Rules

- A party can contain multiple cards
- A card belongs to exactly one party
- Cards are auto-saved as draft immediately after successful AI generation
- Accepted cards remain editable only in the future; no partial field editing in MVP
- Deleting a party should also remove its associated cards locally
- Regeneration should keep the original user input but replace generated output fields

## 13. Risks and PoC Constraints

- Direct client-side AI integration may expose practical API-key/security limitations
- Structured JSON responses may still require validation and fallback handling
- Offline storage behavior differs between native and web and should be planned carefully
- Theme-adaptive UI can grow in complexity if not constrained to tokenized visual accents
