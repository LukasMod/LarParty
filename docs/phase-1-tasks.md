# LarParty PoC — Phase 1 Tasks

This file breaks Phase 1 into concrete execution tasks for the first coding session.

## Phase 1 Goal
Replace the Expo starter shell with a LarParty-specific app shell and route structure.

---

## 1. Remove starter assumptions

### Tasks
- Remove the current starter-oriented home/explore mental model
- Stop relying on starter copy and example components for product flow
- Identify which starter components can be reused temporarily and which should be removed later

### Expected result
The app is no longer conceptually based on the Expo template.

---

## 2. Replace navigation structure

### Tasks
- Replace the current tab-based entry flow with a stack-oriented route flow
- Simplify `src/app/_layout.tsx` to support the LarParty route hierarchy
- Stop using the current `src/components/app-tabs.tsx` as the primary app shell

### Target route structure
- `/`
- `/party/new`
- `/party/[partyId]`
- `/party/[partyId]/card/new`
- `/party/[partyId]/card/[cardId]`

### Expected result
The app has a navigation structure that matches the actual MVP journey.

---

## 3. Create placeholder screens

### Tasks
Create initial route files for:
- Party List Screen
- Create Party Screen
- Party Details Screen
- Create Character Card Screen
- Card Details Screen

Each placeholder screen should have:
- a screen title
- minimal layout container
- temporary placeholder text describing its purpose
- simple navigation hooks where useful

### Expected result
All planned routes exist and can render.

---

## 4. Simplify theming foundation

### Tasks
- Remove dark-mode switching from the root app shell
- Move toward a light-only theme setup
- Keep current token names only if they still fit the planned app structure
- Avoid overbuilding theme logic before the real theme-accent system is introduced later

### Expected result
The app shell is aligned with the MVP decision of light-mode-only.

---

## 5. Establish app-level layout primitives

### Tasks
- Decide on minimal shared layout wrappers for screens
- Keep spacing and safe-area handling consistent
- Prepare a simple reusable page scaffold for phone-first screens
- Ensure placeholders are visually consistent enough to evolve later

### Expected result
New screens share a consistent shell and do not each reinvent layout structure.

---

## 6. Remove or quarantine starter demo dependencies

### Tasks
- Identify starter demo files that should no longer drive the app
- Keep only what is still useful as temporary UI primitives
- Avoid deleting reusable generic pieces too early if they can be adapted
- Plan to phase out unused demo assets/components in later cleanup

### Expected result
The codebase clearly points toward LarParty rather than the Expo example app.

---

## 7. Validate Phase 1 completion

### Checklist
- [ ] App opens to Party List Screen
- [ ] User can navigate to all placeholder screens
- [ ] No starter tab UX remains as the main app experience
- [ ] Root layout is simplified for the product flow
- [ ] Light-only shell behavior is in place
- [ ] The structure is ready for domain types and persistence work in Phase 2

---

## Suggested first coding-session order
1. Simplify `_layout.tsx`
2. Stop using native tabs as the app shell
3. Create route files
4. Add placeholder screen content
5. Simplify theme usage for light-only mode
6. Run the app and verify route flow

---

## Notes for implementation
- Keep changes simple and structural in this phase
- Do not introduce persistence yet
- Do not introduce AI integration yet
- Do not overdesign the screens yet
- Focus on replacing the template shell cleanly so later phases can build on stable routes
