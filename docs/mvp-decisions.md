# LarParty PoC — MVP Decisions

This file records the currently approved product and technical decisions for the PoC.

## Product identity

- App name: LarParty
- Type: React Native Expo PoC
- Audience: LARP and themed-party users, primarily ages 12–46
- Product goal: generate fun, themed character cards for party participants from lightweight user input

## Scope rules

- Party and Party Theme are the same concept
- A party is only a container that groups cards
- Party title is only a user-facing label
- Party title does not change prompt context
- No auth
- No backend
- No notifications
- No payments/subscriptions
- No maps, location, camera, or media
- No demo content on first launch

## Platform priorities

- Primary: iOS and Android
- Secondary: web
- Layout priority: phone-first
- Color mode: dark palette only (the `default` theme is dark; no light variant ships)

## Styling direction

- Style: Party Crazy
- Visual direction should adapt by selected theme
- Use one shared design system with theme-based accents
- Styling system target: Unistyles 3.0

## Party fields in MVP

- title
- theme category
- mood

No date, description, or location in MVP.

## Frozen select options

> **Source of truth is `src/shared/constants/party-options.ts`.** The lists below are a
> readable snapshot. Add values in the code file first, then update the snapshot and the
> `options.*` labels (in the `common` namespace) in both locale files — see
> [`i18n-guide.md`](./i18n-guide.md).
>
> **Removing a value affects existing local data.** Parties are persisted to MMKV with no type
> checking at the storage boundary, and `getPartyTheme` is a total map — a saved party
> holding a value absent from the enum crashes party and card details. There is no migration
> layer (the MVP has no users), so after trimming the enums clear local storage or reinstall.
> See [`architecture.md`](./architecture.md#stores).

### Theme categories

- Fantasy
- Sci-Fi
- Horror

### Mood options

- fun
- serious
- dramatic
- mysterious
- adventurous
- epic
- dark
- romantic
- chaotic
- cozy

Moods are separated so each names a distinct tone. Overlapping candidates (e.g. `silly` vs
`playful`, `scary` vs `dark`, `tense` vs `dramatic`) collapse into the one that reads most
generally.

### Character traits

- calm
- aggressive
- funny
- mysterious
- loyal
- shy
- arrogant
- chaotic

### Sex options

- Male
- Female
- Other

## Card generation rules

- AI generation is a must-have feature
- Provider: Google Gemini (`gemini-3.5-flash-lite`), called directly from the client
- API key comes from `EXPO_PUBLIC_GEMINI_API_KEY`
- Generated field values are written in the resolved app language; JSON schema keys stay
  English — see [`i18n-guide.md`](./i18n-guide.md)
- AI output must be strict structured JSON
- Generated card output must contain:
  - full name with class/archetype
  - 2-sentence background history
  - 3 character traits
  - 1 special movement
  - 1 special word/phrase/sentence

## Card form rules

- inputs:
  - name
  - sex
  - age
  - predefined traits
- trait selection max: 3

## Card lifecycle rules

- a successful generation auto-saves a draft
- a draft can be accepted
- a card can be regenerated
- regenerate requires confirmation
- delete requires confirmation
- deleting a party is allowed
- deleting a card is allowed

## Regeneration behavior

When a user regenerates after already accepting a card:

- keep the accepted version saved
- create a new draft candidate
- do not overwrite the accepted version in place

This means multiple related versions may exist.

## Card presentation rules

- card details screen should support two display modes:
  - collectible card mode
  - readable info mode
- user should be able to switch between them

## Offline rules

Local persistence exists for **reading** saved content offline. It does not make the app
work offline end-to-end.

### Generation requires connectivity

- AI generation and regeneration call a hosted provider over the network. They **require an
  internet connection and access to the provider (Gemini)**.
- There is no offline generation, no on-device model, and no queue-and-sync.
- A user with saved cards and no connectivity can still browse everything they saved. They
  cannot create new cards until they reconnect.

### Must work offline

- viewing saved parties
- viewing saved party themes
- viewing saved cards
- viewing accepted cards
- viewing saved drafts

### Not required offline

- generation
- regeneration
- any AI runtime — always remote

## Web support rule

Web is nice-to-have. Do not let web parity slow down the mobile-first MVP.

## Open questions

UX-level items are tracked in [`discovery-questions.md`](./discovery-questions.md).
