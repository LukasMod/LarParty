# LarParty PoC — Discovery Questions

These questions should be answered before or during the implementation planning session to reduce ambiguity.

## 1. AI Provider and Integration
- Which AI provider should be used for the PoC?
- Should the provider support native JSON mode or schema-constrained output?
- How will API credentials be handled during PoC development if calls are made directly from the client?
- Is there a fallback behavior if generation fails?
- Should regenerate reuse the same prompt with slight variation, or intentionally ask for a fresh interpretation?

## 2. Prompt Design
- Should theme categories be stored as internal enum-like values and displayed with friendlier labels?
- Should mood influence only tone, or also the level of dramatic/silly content?
- Should the entered name always be preserved exactly, or can AI reinterpret it slightly?
- Should the prompt forbid copyrighted franchise-specific references when using inspired themes like StarWars-inspired or Harry-Potter-inspired?
- Should content safety rules be enforced for younger users?

## 3. Party Creation UX
- How many theme categories should be available in MVP?
- How many mood options should be available in MVP?
- Should users be allowed to create a party without cards?
- Should party list items show card count?
- Should delete party require confirmation?

## 4. Character Creation UX
- Should trait selection have a maximum number of selected traits?
- Should age be a numeric input only?
- Should sex be free text, segmented options, or optional?
- Should name be required?
- Should there be starter defaults for faster testing?

## 5. Card Lifecycle
- What is the exact difference in UI between draft and accepted cards?
- Should a regenerated card remain draft even if the previous version had been accepted?
- Should accepted cards still be regeneratable?
- Should deletion of a card require confirmation?
- Should drafts appear in the same list as accepted cards?

## 6. Card Presentation
- What is the preferred default view mode on the card details screen?
- Should the selected card view mode be remembered globally or only per session?
- Should collectible mode prioritize visuals over density?
- Should info-sheet mode prioritize readability and sharing/printing potential?

## 7. Offline and Persistence
- Should the app preload any seed/demo data on first launch?
- Should local persistence be wiped on uninstall only, or should there be an in-app reset option?
- Should web storage behavior be treated as best effort only?
- Should generation failures produce unsaved temporary states or persisted failed drafts?

## 8. Platform Priorities
- How much effort should be spent on web parity in the PoC?
- Should tablet layouts be ignored for now?
- Should the app support keyboard-friendly web form interactions from the start?

## 9. Design System Direction
- What visual tokens should change by theme: colors, icons, textures, borders, typography accents?
- Should each theme category have a predefined accent palette?
- Should the party list use theme previews or remain visually neutral?
- How bold should the Party Crazy style be in MVP?

## 10. Future Evolution
- Should future auth be user account based or anonymous cloud sync first?
- Should future backend own generation prompts centrally?
- Should future versions support sharing/export/print?
- Should future versions allow player-facing and host-facing modes?
