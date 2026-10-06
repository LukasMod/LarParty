# Discovery Questions

Open product and UX questions. Add a question here **before** changing scope. Decided
answers move to [`mvp-decisions.md`](./mvp-decisions.md) or the relevant guide and are removed
from this file.

## Card presentation mode

`mvp-decisions.md` requires two display modes with a user-facing switch, but
`src/app/party/[partyId]/card/[cardId].tsx` passes a fixed `displayMode="collectible"` and
does not render `CardDisplayModeSwitch`. The persisted `cardDisplayMode` preference affects no
screen. On-screen, both modes render the same section list differing only by surface color and
border width.

Decide: build a distinct info layout and wire the switch, or drop the feature and the
preference.

- What is the preferred default view mode on the card details screen?
- Should collectible mode prioritize visuals over density?
- Should info-sheet mode prioritize readability and sharing/printing potential?

## Theme categories and moods

The set is 3 categories (Fantasy, Sci-Fi, Horror) and 10 moods.

- Are 3 categories enough variety for repeat players, or does the app feel samey?
- Do the remaining moods read as distinct — particularly `dramatic` vs `epic`, and
  `mysterious` vs `dark`?

Changing this set affects already-saved local data: a saved party holding a dropped value
crashes party and card details. There is no migration layer, so after trimming the enums
clear local storage (or reinstall). See
[`architecture.md`](./architecture.md#stores).

## Offline generation UX

Generation always requires connectivity; saved content stays browsable offline. Open is the
presentation:

- Should the generate button be disabled when offline, or stay enabled and surface an error?
- Detect connectivity, or attempt and report the failure?
- Error copy should be translated and distinguish "no connection" from "provider failed" — see
  the generation-errors hazard in [`architecture.md`](./architecture.md#dead-code-and-hazards).

## Visual system

- Should each theme category also vary icons, textures, or typography — not just color?
- How bold should the "Party Crazy" style become?

## Persistence

- Should an in-app reset option exist, or is uninstall the only wipe path?

## Platform

- How much effort should web parity get? Should web support keyboard-driven forms?
- Should tablet layouts get any real treatment?

## Future product

- Account-based auth or anonymous sync first?
- Should a backend own prompts centrally?
- Sharing, export, or print?
- Separate player-facing and host-facing modes?
