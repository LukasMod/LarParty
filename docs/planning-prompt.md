# LarParty PoC — Planning Session Prompt

Use this prompt in a future planning session to produce a detailed technical implementation plan.

---

Help me design a highly detailed implementation plan for a React Native Expo PoC app called **LarParty**.

## Product context

LarParty is a playful app for LARP and themed-party users. The app lets a user create a themed party and generate AI-powered character cards for party participants.

This is a PoC, so the solution should stay intentionally lean while still using clean architecture and current best practices.

## Platform and tech context

- Framework: React Native with Expo
- Styling: Unistyles 3.0
- Primary platforms: iOS and Android
- Secondary platform: web, only if Expo support remains clean
- Layout priority: phone-first
- Color mode: light mode only
- Use current Expo and React Native best practices, based on up-to-date documentation

## Product rules

- Party and Party Theme are the same entity
- Party is just a grouping container for cards
- Party has only:
  - title
  - theme category
  - mood
- Party title is only a label and does not affect AI prompt context
- No auth
- No backend
- No notifications
- No payments
- No maps, location, camera, or media

## Core MVP features

1. View list of all parties
2. Create a party
3. Delete a party
4. View one party and its cards
5. Create a character card from a form
6. Generate the card via AI using real API integration from the start
7. Auto-save generated cards as draft
8. Accept a generated card
9. Regenerate a full card
10. Delete a card
11. View card details offline after local persistence
12. Allow switching card details presentation between:

- collectible card style
- readable info sheet style

## Party creation inputs

- title
- theme category from predefined options
- mood from predefined options

Examples of theme categories:

- Fantasy
- Sci-Fi
- Horror
- StarWars-inspired
- Harry-Potter-inspired
- and other extensible options

Examples of mood options:

- fun
- serious
- scary
- chaotic
- dramatic

## Character card input form

- name
- sex
- age
- predefined traits

Examples of traits:

- calm
- aggressive
- funny
- mysterious
- loyal
- shy
- arrogant
- chaotic

## AI generation requirements

The app should build a prompt using:

- party theme category
- mood
- entered name
- entered sex
- entered age
- selected traits

The AI must return strict structured JSON mapped into the UI.

Expected output fields:

- generatedNameWithClass: string
- backgroundHistory: string (2 sentences)
- characterTraits: string[] (exactly 3)
- specialMovement: string
- specialPhrase: string

Generation behavior:

- successful generation auto-saves a draft card locally
- user can accept the card
- user can regenerate the full card
- regeneration should preserve original input data but replace generated output data
- no field-level editing in MVP

## Offline requirements

Must work offline for:

- viewing saved parties
- viewing saved party themes
- viewing saved card drafts and accepted cards

Does not need to work offline for:

- generation
- regeneration

## Design direction

- overall tone: Party Crazy
- visual style should adapt to selected party theme
- use one consistent design system with theme-based accents rather than fully separate app skins
- card details should support both a decorative collectible mode and a cleaner readable mode

## Planning tasks

Please create a detailed implementation plan that includes:

1. **Recommended app architecture**
   - feature/module organization
   - screen structure
   - service boundaries
   - state boundaries

2. **Expo-specific recommendations**
   - navigation choice
   - persistence/storage strategy
   - forms approach
   - validation approach
   - web support considerations
   - direct AI API integration considerations in Expo

3. **Domain modeling**
   - TypeScript types/interfaces for Party and CharacterCard
   - card status model
   - input vs generated data separation

4. **Screen-by-screen plan**
   - purpose
   - inputs
   - actions
   - states
   - edge cases
   - acceptance criteria

5. **AI integration plan**
   - prompt builder strategy
   - JSON schema validation strategy
   - error handling strategy
   - regenerate behavior
   - constraints/safety notes for direct client-side PoC integration

6. **Persistence and offline plan**
   - where to store data locally
   - how to persist drafts vs accepted cards
   - deletion behavior
   - startup hydration flow

7. **UI planning**
   - how to implement theme-driven styling simply
   - how to support the two card detail display modes
   - suggested design tokens or theming model

8. **Phased roadmap**
   - Phase 1: skeleton navigation and static screens
   - Phase 2: forms and local persistence
   - Phase 3: AI integration and structured response handling
   - Phase 4: card view modes and visual polish
   - Phase 5: web compatibility pass

9. **Folder structure proposal**
   - practical Expo project structure for this PoC
   - scalable enough for future backend/auth additions

10. **Technical risks and assumptions**
    - direct client-side AI integration tradeoffs
    - offline limitations
    - platform differences
    - future migration notes

11. **Open questions**
    - identify unresolved product and technical questions that should be decided before implementation

## Output expectations

- Keep the PoC small and achievable
- Prefer practical implementation over enterprise complexity
- Do not overengineer backend-like abstractions unless they help future evolution
- Be explicit about recommended packages and why
- Align with current Expo and React Native ecosystem guidance
- Assume this plan will be used to create markdown implementation instructions for coding sessions
