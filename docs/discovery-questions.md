# LarParty PoC — Discovery Questions

Questions raised before the planning session. Most are settled — answers live in
[`mvp-decisions.md`](./mvp-decisions.md) and in the code. Keep this file for what is
genuinely still open. Add new scope questions here **before** changing scope.

## Open

### Card presentation mode (regressed)

`mvp-decisions.md` freezes two display modes with a user-facing switch, but
`src/app/party/[partyId]/card/[cardId].tsx` hardcodes `displayMode="collectible"` and
never renders `CardDisplayModeSwitch`. The persisted `cardDisplayMode` preference affects
no screen. Decide: rewire the switch, or drop the feature and the preference.

### Offline generation UX

Settled as policy: no local LLM, so generation/regeneration always need connectivity, while
saved content stays browsable offline. Open is only the _presentation_:

- Should the generate button be disabled when offline, or stay enabled and surface an error?
- Detect connectivity, or attempt and report the failure?
- Should an offline attempt preserve the typed form input? (Today it does, since nothing is
  submitted or saved on failure.)
- Error copy should be translated and distinguish "no connection" from "provider failed" —
  see the generation-errors hazard in [`architecture.md`](./architecture.md#dead-code-and-hazards).

### Still unanswered

- What is the preferred default view mode on the card details screen?
- Should collectible mode prioritize visuals over density?
- Should info-sheet mode prioritize readability and sharing/printing potential?
- Should an in-app reset option exist, or is uninstall the only wipe path?
- Should generation failures persist a failed draft, or stay unsaved? (Today: unsaved.)
- How much effort should web parity get? Should web support keyboard-driven forms?
- Should tablet layouts get any real treatment?
- Should each theme category also vary icons, textures, or typography — not just color?
- How bold should the "Party Crazy" style become?
- Future: account-based auth or anonymous sync first?
- Future: should a backend own prompts centrally?
- Future: sharing, export, or print?
- Future: separate player-facing and host-facing modes?

## Resolved — for history

Do not re-litigate here. Verify against code before treating any of these as open.

| Area                            | Resolution                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| AI provider                     | Gemini `gemini-2.5-flash-lite`, client-side, schema-constrained JSON. Key via `EXPO_PUBLIC_GEMINI_API_KEY` |
| Generation failure UX           | Errors surface as inline message; nothing is saved                                                         |
| Theme/mood storage              | Internal enum values with translated display labels                                                        |
| Copyrighted franchises          | Prompt forbids copying canon characters, factions, plotlines                                               |
| Content safety                  | Prompt requires broad-age-appropriate, non-explicit output                                                 |
| Theme category count            | 6                                                                                                          |
| Mood count                      | 18 (grown past the originally frozen 8)                                                                    |
| Party without cards             | Allowed; empty state shown                                                                                 |
| Card count in list              | Shown, pluralized                                                                                          |
| Delete party                    | Confirmation required; cascades to cards                                                                   |
| Trait max                       | 3                                                                                                          |
| Age input                       | Numeric string input, parsed and validated                                                                 |
| Sex input                       | Enum of 3 options                                                                                          |
| Name required                   | Yes; starter default only for age (`25`)                                                                   |
| Draft vs accepted UI            | Status badge and status-dependent actions                                                                  |
| Regenerate after accept         | New draft, accepted version preserved                                                                      |
| Accepted cards regeneratable    | Yes                                                                                                        |
| Delete card                     | Confirmation required                                                                                      |
| Drafts in same list as accepted | Yes                                                                                                        |
| View mode persistence           | Global via preferences store — but see the regression above                                                |
| Seed/demo data                  | None on first launch                                                                                       |
| Web storage                     | Best effort; mobile first                                                                                  |
