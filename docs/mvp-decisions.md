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
- Color mode: light mode only

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

### Theme categories

- Fantasy
- Sci-Fi
- Horror
- Magic
- Casual
- Corporation

### Mood options

- fun
- serious
- scary
- silly
- dramatic
- chaotic
- mysterious
- adventurous

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
- Primary AI direction: local LLM first
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

### Must work offline

- viewing saved parties
- viewing saved party themes
- viewing saved cards
- viewing accepted cards
- viewing saved drafts

### Not required offline

- generation
- regeneration
- AI runtime unless proven feasible later

## Web support rule

Web is nice-to-have. Do not let web parity slow down the mobile-first MVP.

## Open technical uncertainty

The biggest unresolved technical question is the exact local LLM path and its compatibility with Expo and web support. This requires follow-up validation before final implementation package choices are locked.
