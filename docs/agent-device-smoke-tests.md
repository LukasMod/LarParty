# Agent Device Smoke Tests

This document defines lightweight `agent-device` checks for the LarParty PoC. The goal is to let an AI agent quickly verify that the main screens still render correctly, basic navigation still works, and the core flow is still functional while the UI is evolving.

These are **smoke tests**, not full acceptance tests. They should stay fast, resilient, and easy to run repeatedly during development.

## Purpose

Use these checks to confirm:

- the app opens successfully
- each primary screen can still be reached
- visible labels and CTAs still exist
- core local flows still work
- destructive actions still show confirmation dialogs
- saved state still appears after navigation

## Scope

Covers the current PoC screens:

- Party List
- Create Party
- Party Details
- Create Character Card
- Card Details
- Settings
- Explore (orphaned route, not in the stack config — see below)

> **Labels are translated.** Every string quoted below is the **English** copy. If the
> simulator language is Polish, all of these checks fail spuriously — force English via
> the simulator language, or set the in-app preference to `English` on the Settings
> screen first. There is no `en` override flag; resolution follows the device locale.

## Preconditions

Before running these checks:

1. The app is running in an iOS simulator or Android emulator/device.
2. `agent-device` is connected to the target platform.
3. The app build is installed and launchable.
4. If running generation checks, `EXPO_PUBLIC_GEMINI_API_KEY` is configured and network access is available.

## iOS simulator quickstart

This is the shortest known-good setup for LarParty on the iOS simulator.

### 1. Confirm `agent-device` can see the simulator

```bash
agent-device devices --platform ios
```

A working setup should list at least one simulator. In this repo we successfully used:

- `iPhone 17 Pro`

### 2. If snapshots fail with Apple developer-tool permissions

If `agent-device snapshot -i` fails with a message like `Developer mode is disabled for Apple development tools`, run this in your terminal:

```bash
sudo DevToolsSecurity -enable
```

Then retry the snapshot command.

### 3. Confirm LarParty is installed on the simulator

LarParty is configured in `app.json` with:

- app name: `LarParty`
- iOS bundle id: `com.anonymous.LarParty`

Useful check:

```bash
agent-device apps --platform ios --device "iPhone 17 Pro" --all | rg "LarParty|com\.anonymous\.LarParty"
```

### 4. Launch the app

```bash
agent-device open LarParty --platform ios --device "iPhone 17 Pro" --session default --relaunch
```

### 5. Dismiss the React Native overlay if present

On this project, a React Native warning overlay may appear and block interaction. If the snapshot mentions an overlay, run:

```bash
agent-device react-native dismiss-overlay --platform ios --device "iPhone 17 Pro"
```

Then capture a fresh snapshot.

### 6. Capture a working snapshot

```bash
agent-device snapshot -i --platform ios --device "iPhone 17 Pro" --session default
```

A successful Party List snapshot should show labels like:

- `LarParty`
- `Ready to create your next party?`
- `Create your first party`

## Practical LarParty runbook

This is the exact flow that worked during the iOS simulator check in this repository.

### Party List → Create Party → Party Details

1. Open LarParty.
2. Snapshot the Party List.
3. Tap `Create your first party` (empty state) or the `+` in the header.
4. On Create Party, scroll if needed until `Save party` is visible.
5. Enter `Agent Device Tavern` into the party-name field.
6. Keep the default selections `Fantasy` and `Fun` unless a different fixture is needed.
7. If the keyboard covers the bottom CTA, dismiss it before saving.
8. Tap `Save party`.
9. Confirm Party Details shows:
   - `Agent Device Tavern`
   - `Fantasy · Fun`
   - `Character Cards`
   - `Create a character card`

### Party Details → Create Character Card → Card Details

1. Tap `Create a character card`.
2. Confirm the screen shows:
   - `Create Character Card`
   - `Character name`
   - `Sex`
   - `Age`
   - `Traits`
   - `Generate character card`
3. Submit once with an empty name to verify `Character name is required.`
4. Fill the form with:
   - name: `Mira Nightbloom`
   - sex: `Other`
   - age: `25`
   - traits: `Calm`, `Funny`, `Loyal`
5. Dismiss the keyboard if needed.
6. Tap `Generate character card`.
7. Wait and snapshot again.
8. Confirm navigation to Card Details showing at least:
   - generated title
   - `Draft card · Agent Device Tavern`
   - `Background`, `Character traits`, `Special movement`, `Special phrase`

## Known automation gotchas

These were observed during the real run and should be accounted for by future agents.

- iOS snapshots may be slow; a warning about slow snapshots does not automatically mean failure.
- A React Native warning overlay can partially cover the app and should be dismissed before meaningful interaction.
- The iOS keyboard can block taps on bottom CTAs like `Save party` and `Generate character card`.
- Trait selection is not clearly exposed in snapshots; if a submit claims no valid traits were selected, re-snapshot and re-tap the intended chips.
- The Create Party validation message was not reliably confirmed in snapshots during the run, even though the screen did not submit with an empty title.
- The Create Character Card validation message `Character name is required.` was confirmed successfully.
- Text entry may occasionally differ slightly from the intended string under automation, so always verify the post-type snapshot before submitting.

## General agent-device operating pattern

Use the same loop on every screen:

1. Open the app.
2. Run `agent-device snapshot -i`.
3. Inspect visible interactive elements and labels.
4. Click by element ref.
5. Re-run `agent-device snapshot -i` after every navigation or meaningful UI change.
6. If an expected target is off-screen, scroll first and snapshot again.

Example pattern:

```bash
agent-device open LarParty --platform ios
agent-device snapshot -i
agent-device click @e2
agent-device snapshot -i
```

## Shared rules for AI agents

- Prefer clicking controls by the text shown in the latest snapshot.
- Re-snapshot after each screen transition.
- Treat changed copy as a possible regression only if the meaning of the flow changed or the expected CTA is missing.
- If a destructive action is triggered, verify the confirmation dialog appears before confirming deletion.
- If generation is unavailable because the API key is missing or the network is down, treat generation-dependent checks as **blocked**, not automatically failed.
- When a screen does not match the expected state, capture a snapshot and note the visible mismatch.

## Recommended test fixtures

Use stable, repeatable input values.

### Seeding fake data instead of typing it

For checks that only need parties and cards to **exist** — list rendering, counts,
navigation, cascade deletes, offline browsing — seed data with the debug tools instead of
driving the create forms and spending API calls. On the **Settings** screen (dev builds only)
the **Debug tools** section offers:

- `Add parties (small set)` — 3 parties, one per theme category, 1 card each.
- `Add parties (large set)` — 10 parties, 10 cards each; enough rows to scroll and to check
  list performance.
- `Clear all parties and cards` — destructive, confirmation-gated; empties both stores.

Seeding writes straight into the persisted stores, calls no API, and needs no
`EXPO_PUBLIC_GEMINI_API_KEY`. It **replaces** all saved parties and cards rather than
appending, and the data persists across reloads. Generation-dependent checks (create card,
regenerate) still require a real key and network. Mechanics are in
[`architecture.md`](./architecture.md#debug-tools-dev-only).

Typical use:

1. Open Settings and tap a seed button; the app lands on the Party List.
2. Snapshot and confirm party cards with titles, `Theme · Mood` lines, and character counts.
3. Run the list/details/delete checks against that data.
4. Tap `Clear all parties and cards` to return to the empty state.

### Party fixture

- Party name: `Agent Device Tavern`
- Theme category: `Fantasy`
- Mood: `Fun`

### Character fixture

- Character name: `Mira Nightbloom`
- Sex: `Other`
- Age: `25`
- Traits: `Calm`, `Funny`, `Loyal`

If a unique name is needed to avoid collisions, append a short suffix, for example:

- `Agent Device Tavern 01`
- `Mira Nightbloom 01`

## Screen smoke tests

---

## 1. Party List Screen

Route source: `src/app/index.tsx`

### Goal

Verify the app boots into the main screen and the main party entry flow is still available.

### Reach this screen

- Launch the app fresh, or
- navigate back to the root party list

### Expected visible content

Look for:

- `LarParty`
- `Ready to create your next party?` and supporting copy
- `Create your first party` (empty state) or a `+` button in the header

Depending on data state, one of these should also appear:

- empty state copy like `Create a themed party, generate character cards...`, or
- at least one saved party card with title, theme · mood line, and character count

### Checks

1. Open the app.
2. Snapshot the screen.
3. Confirm the main title and primary CTA are visible.
4. Confirm the screen is not visually broken:
   - no blank body
   - no overlapping CTA
   - no obviously clipped header text
5. If parties already exist, confirm at least one party card is visible and appears tappable.

### Pass criteria

- App lands on Party List.
- `Create a new party` is visible.
- Either the empty state or a list of parties is visible.

---

## 2. Create Party Screen

Route source: `src/app/party/new.tsx`

### Goal

Verify party creation UI still renders, input validation still works, and saving still navigates into the new party.

### Reach this screen

1. From Party List, tap `Create a new party`.
2. Snapshot after navigation.

### Expected visible content

Look for:

- `Create Party`
- `Party name`
- `Theme category`
- `Mood`
- `Save party`

### Checks

#### A. Visual smoke

1. Confirm the heading and all form sections are visible.
2. Confirm multiple chips are visible under theme and mood.
3. Confirm `Save party` is visible.

#### B. Validation smoke

1. Without entering a party name, tap `Save party`.
2. Snapshot again.
3. Confirm validation text appears: `Party name is required.`

#### C. Happy path creation

1. Enter `Agent Device Tavern` into `Party name`.
2. Select:
   - `Fantasy`
   - `Fun`
3. Tap `Save party`.
4. Snapshot after navigation.
5. Confirm the app navigates to the new party details screen.

### Pass criteria

- Empty-name validation appears.
- A valid save navigates forward.
- The next screen shows the created party.

---

## 3. Party Details Screen

Route source: `src/app/party/[partyId].tsx`

### Goal

Verify saved party data is shown, card list area renders correctly, and the next-step CTA still works.

### Reach this screen

- Immediately after creating a party, or
- tap a party card from Party List

### Expected visible content

Look for:

- created party title, e.g. `Agent Device Tavern`
- party metadata line with selected theme and mood
- `Character Cards`
- `Create a character card`
- `Delete party`

Depending on state, one of these should appear:

- `No cards yet...`, or
- a list of saved cards

### Checks

1. Confirm the selected party title is shown.
2. Confirm the theme and mood line is shown.
3. Confirm the `Character Cards` section is visible.
4. Confirm the create-card CTA is visible.
5. Confirm the delete-party CTA is visible.
6. If no cards exist yet, confirm the empty copy is shown.
7. Tap `Delete party` once only for dialog verification.
8. Confirm a destructive confirmation dialog appears.
9. Cancel the dialog so the test data remains available unless this run is specifically testing deletion.

### Pass criteria

- Party details are visible.
- Character card section renders.
- Delete action shows confirmation before destructive change.

---

## 4. Create Character Card Screen

Route source: `src/app/party/[partyId]/card/new.tsx`

### Goal

Verify the character-input form still renders, local validation works, trait limits behave correctly, and generation can be attempted.

### Reach this screen

1. From Party Details, tap `Create a character card`.
2. Snapshot after navigation.

### Expected visible content

Look for:

- `Create Character Card`
- current party title and theme subtitle
- `Character name`
- `Sex`
- `Age`
- `Traits`
- helper copy `Pick up to 3 traits.`
- `Generate character card`

### Checks

#### A. Visual smoke

1. Confirm all sections and the primary CTA are visible.
2. Confirm sex options are visible.
3. Confirm trait chips are visible.

#### B. Validation smoke

1. Tap `Generate character card` with the form empty.
2. Confirm `Character name is required.` appears.
3. Enter a name but set an invalid age if needed.
4. Confirm `Enter a valid age.` appears when appropriate.
5. Attempt submission with zero traits selected.
6. Confirm `Choose between 1 and 3 traits.` appears.

#### C. Trait-limit smoke

1. Select three traits.
2. Try selecting a fourth trait.
3. Confirm the UI still behaves as a max-3 selector and does not clearly allow an active fourth selection.

#### D. Happy path generation attempt

1. Fill the form with:
   - `Mira Nightbloom`
   - `Other`
   - `25`
   - `Calm`, `Funny`, `Loyal`
2. Tap `Generate character card`.
3. Snapshot during and after submission.
4. While in flight, confirm the generating overlay covers the screen with a `Cancel` button and
   that the form behind it is not tappable.
5. If AI is configured and generation succeeds, confirm navigation to Card Details.
6. If AI is not configured or fails externally, capture the error state and mark this as blocked or failed based on the actual message.

#### E. Cancel mid-generation

1. Submit a valid form again.
2. Tap `Cancel` on the overlay before the response arrives.
3. Confirm the overlay hides, the form keeps its values, and no card was created.
4. Confirm the back gesture and the generate button work again.

### Pass criteria

- Validation errors appear for bad input.
- Trait selection stays bounded to three.
- Generation can be attempted.
- On success, app navigates to Card Details.
- Cancel aborts the request, hides the overlay, and saves nothing.

---

## 5. Card Details Screen

Route source: `src/app/party/[partyId]/card/[cardId].tsx`

### Goal

Verify generated card content renders, display-mode switching still works, and card actions still behave correctly.

### Reach this screen

- After a successful generation, or
- by opening an existing saved card from Party Details

### Expected visible content

Look for:

- generated card title
- card status line (`Draft card` or `Accepted card`)
- sections:
  - `Background`
  - `Character traits`
  - `Special movement`
  - `Special phrase`
- action buttons:
  - `Accept card` when status is draft
  - `Regenerate card`
  - `Delete card`

This screen has no display-mode chips: the route passes a fixed `displayMode="collectible"`
and does not mount `CardDisplayModeSwitch`. If `Collectible view` / `Info view` appear here,
the screen has changed — update this doc and [`discovery-questions.md`](./discovery-questions.md).

### Checks

#### A. Visual smoke

1. Confirm all main content sections are visible.
2. Confirm the layout looks coherent in the default mode.
3. Confirm there is visible separation between sections and no obviously broken formatting.

#### B. Display mode switch — not reachable

Confirm no mode chips render. If they do, the feature has been wired: tap `Info view`,
snapshot, confirm the same content survives the switch, tap `Collectible view`, snapshot.

#### C. Draft acceptance

1. If the card is still draft, tap `Accept card`.
2. Snapshot again.
3. Confirm the draft CTA disappears and the status changes to accepted.

#### D. Regenerate dialog and flow

1. Tap `Regenerate card`.
2. Confirm the confirmation dialog appears.
3. Cancel once for dialog verification.
4. If running a full regeneration check and AI is configured, trigger it again and confirm the
   generating overlay appears and a new draft is created and opened.
5. To check cancellation, trigger it once more and tap `Cancel` on the overlay: the overlay
   hides, the current card stays open, and no new draft is saved.

#### E. Delete dialog

1. Tap `Delete card`.
2. Confirm a destructive confirmation dialog appears.
3. Cancel unless this run is specifically validating deletion behavior.

### Pass criteria

- Card details render fully.
- No display-mode chips appear.
- Accept action updates the UI correctly.
- Regenerate and delete both require confirmation.

---

## 6. Settings Screen

Route source: `src/app/settings.tsx`

### Goal

Verify the language preference renders, switches, and changes app copy.

### Reach this screen

From Party List, tap the gear icon in the header (accessibility label `Settings`).

### Expected visible content

- `App language` section title
- chips: `System default`, `English`, `Polish`
- a line confirming the current language, or that the app is following the device language

### Checks

1. Open Settings and snapshot.
2. Confirm the current-language line reflects the resolved language.
3. Tap `Polish`.
4. Go back to Party List. Snapshot.
5. Confirm headings and buttons are now Polish. Reliable markers: the create CTA reads
   `Utwórz nową imprezę`, the gear's label is `Ustawienia`, and the section title reads
   `Język aplikacji`.
6. Return to Settings, set `System default`, and confirm the line reports the device
   language.

### Pass criteria

- Preference persists across navigation.
- Selecting `Polish` changes visible copy app-wide, including navigation titles.
- `System default` resolves to a supported language rather than blank text.

### Note

Generation output language follows this setting too. A full i18n check would generate a
card in Polish and confirm the generated text is Polish. That costs an API call, so run it
only when touching i18n or generation.

---

## 7. Explore Screen

Route source: `src/app/explore.tsx` — **orphaned**. Not declared in the stack in
`src/app/_layout.tsx`, and nothing links to it. Its copy claims "local LLM generation",
which the app does not have.

### Goal

Verify the secondary informational screen renders and the back navigation CTA works.

### Reach this screen

Deep-link or hand-edit the route, e.g. `larparty://explore`, since no UI path reaches it.

### Expected visible content

Look for:

- `Explore`
- `Current progress`
- bullet items describing PoC progress
- `Back to parties`

### Checks

1. Confirm the screen renders without layout issues.
2. Confirm progress items are visible.
3. Tap `Back to parties`.
4. Confirm navigation returns to Party List.

### Pass criteria

- Explore renders.
- Back navigation works.

---

## 8. Offline Behavior

Generation requires internet by design. Verify offline browsing still works and generation
fails without corrupting saved state.

### Setup

Generate at least one saved party and one accepted card while online. Then enable airplane
mode (or disable the simulator's network).

### Checks

1. Launch/foreground the app offline.
2. Confirm Party List renders saved parties (not the empty state).
3. Open Party Details. Confirm saved cards render.
4. Open a card. Confirm its content renders.
5. Tap `Create a new party` and create a party. Confirm it saves and appears in the list.
6. Open the new party, fill a valid character form, tap `Generate character card`.
7. Confirm an error is shown, the generating overlay hides, and the button is enabled again.
8. Go back. Confirm no new card was created.
9. Re-enable the network and confirm generation succeeds.

### Pass criteria

- All saved content browsable offline.
- Party creation works offline (local persistence only).
- Offline generation fails gracefully: no navigation, no half-saved card, and no stuck
  generating overlay.
- Recovery works after reconnecting with no restart.

### Known issue

The failure text is currently the raw SDK/network message, not translated copy. Expect
English technical text here. See
[`architecture.md`](./architecture.md#dead-code-and-hazards).

---

## Recommended end-to-end smoke flow

Use this when you want one practical regression pass instead of isolated screen checks.

1. Launch app to Party List.
2. Open Create Party.
3. Verify empty-name validation.
4. Create `Agent Device Tavern`.
5. Verify Party Details.
6. Open Create Character Card.
7. Verify validation states.
8. Fill valid character input.
9. Attempt generation.
10. If generation succeeds:
    - verify Card Details
    - accept the card
    - verify accepted state
    - verify regenerate confirmation
    - verify delete confirmation
11. Return to Party Details.
12. Confirm the saved card appears in the list.
13. Return to Party List.
14. Confirm the saved party appears in the list.
15. Open Settings from the header gear.
16. Switch language to `Polish` and confirm app copy changes.
17. Switch back to `System default`.

## Failure reporting format

When a smoke test fails, report:

- screen name
- action attempted
- expected result
- actual visible result
- latest snapshot evidence

Example:

- Screen: Create Party
- Action: tapped `Save party` with empty name
- Expected: validation message `Party name is required.`
- Actual: no validation message appeared
- Evidence: latest `snapshot -i` after submit

## Maintenance rules

Update this doc when any of these change:

- visible CTA labels — they live in `src/shared/i18n/locales/en.ts`; this file quotes the
  English copy, so a copy change breaks these checks silently
- validation copy
- route flow between screens
- card actions
- display mode labels
- display mode wiring (mounting `CardDisplayModeSwitch` makes check 5.B reachable)
- language options, or new keys under `settings.language`
- generation prerequisites

Prefer keeping these checks anchored to visible UX labels rather than internal implementation details so AI agents can continue using them after refactors.
