# Archive

Planning-era documents. Kept for historical context only. **Do not implement from
these files** — they describe the repo as it was before the build, not as it is now.

| File                                         | What it was                              | Why it is archived                                                           |
| -------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| [`planning-prompt.md`](./planning-prompt.md) | The original prompt used to plan the PoC | Input to planning, not a spec                                                |
| [`phase-1-tasks.md`](./phase-1-tasks.md)     | Phase 1 shell-migration checklist        | Completed. Routes and layout exist                                           |
| [`build-checklist.md`](./build-checklist.md) | Phase 0–11 execution checklist           | Build finished. Boxes were never ticked, so the file reads as "nothing done" |
| [`i18n-plan.md`](./i18n-plan.md)             | Design proposal for react-i18next        | Landed as en + pl. Read [`../i18n-guide.md`](../i18n-guide.md) instead       |
| [`theme-proposals.md`](./theme-proposals.md) | Brainstorm for bolder themes and moods   | Not adopted. Only the 6 existing theme categories ship                       |

## Freshness rules for the rest of `docs/`

- Living docs must describe the repo as it exists. No "planned", "recommended",
  or "pending validation" language for things that already shipped.
- When code and a living doc disagree, **code wins**. Fix the doc in the same change.
- Scope changes and enum changes go to `../mvp-decisions.md`. Unresolved product or
  UX questions go to `../discovery-questions.md`.
- If a doc becomes a historical artifact, move it here with a one-line banner at the
  top saying so, and update [`../README.md`](../README.md) and `../../CLAUDE.md`.
