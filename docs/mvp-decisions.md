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
> **Removing a value affects existing local data.** Parties and cards are persisted to MMKV
> with no type checking at the storage boundary, and there is no migration layer (the MVP has
> no users). A saved party holding a removed theme category crashes party and card details,
> because `getPartyTheme` is a total map and the lookup returns `undefined`. A saved entity
> holding a removed mood or trait renders the raw i18next key in place of a label. Either way,
> trimming an enum means clearing local storage or reinstalling. See
> [`architecture.md`](./architecture.md#stores).

### Theme categories

- Fantasy
- Sci-Fi
- Horror

### Mood options

One tone per party. Each names its own feeling axis, and none duplicates a theme category:
theme sets the genre, mood sets how the night is played.

- fun
- dramatic
- adventurous
- intrigue
- wild
- cheesy
- awkward

### Character traits

Six light and six dark. Each names its own axis, so any three combine without one
cancelling another.

- vengeful
- ambitious
- chaotic
- empathetic
- loyal
- funny
- intelligent
- manipulative
- charismatic
- calm
- mysterious
- arrogant

Each trait can carry an intensity value from -3 to 3, where 0 is the trait exactly as its name
reads. `3` is the trait pushed to a too-much extreme, `-3` is its exact opposite held as a
principle. The scale and its wording live in `src/features/generation/utils/trait-value.ts` and
reach the prompt only when at least one value leaves 0.

### Sex options

- Male
- Female
- Other

## Card generation rules

- AI generation is a must-have feature
- Provider: Google Gemini (`gemini-3.6-flash-lite`), called directly from the client
- Sampling is creative by design: `temperature: 1.15`, `topP: 0.95`
- API key comes from `EXPO_PUBLIC_GEMINI_API_KEY`
- Generated field values are written in the resolved app language; JSON schema keys stay
  English — see [`i18n-guide.md`](./i18n-guide.md)
- AI output must be strict structured JSON
- Generated card output must contain:
  - full name with class/archetype
  - 3-sentence background history
  - 3 character traits
  - 1 special movement
  - 1 special word/phrase/sentence
- The prompt avoids the archetype the traits imply, bans stock setups (chosen one, fallen noble,
  dark past, cursed object), and forbids repeating the name, phrase, or mannerism of any other
  card in the same party
- The party's first card also writes a 2-3 sentence shared world (`partyHistory`) that later cards
  receive and must stay consistent with. It is saved on the party, first write wins, and the field
  never reaches the card. The backend is meant to own this later; for now it lives in the local
  party store
- Regenerating the same seed adds a divergence instruction that holds the traits fixed and
  changes the trade, place, epithet, mannerism, and phrase

## Card form rules

- inputs:
  - name
  - sex
  - predefined traits
  - per-trait intensity level
- trait selection max: 3
- intensity level: integer -3 to +3, step 1, default 0, one per selected trait
- the level steers generation only: `+3` reads as a defining trait, `0` as light flavour,
  `-3` as a weakness or reluctance around that trait
- the level is not shown on the saved card details screen; the generated `characterTraits`
  phrases are what the card displays
- deselecting a trait drops its level; re-selecting starts again at 0

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
