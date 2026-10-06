# Documentation Map

`../CLAUDE.md` holds the short version of how the app is built plus the docs policy. This
index says what each doc covers.

## Reference

| Doc                                      | Role                                                                                | Read it when                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`architecture.md`](./architecture.md)   | How the code works: layout, screen-model pattern, stores, generation flow, hazards  | Before any code change. Start here if you are new to the repo |
| [`mvp-decisions.md`](./mvp-decisions.md) | Domain rules: enums, card lifecycle, regeneration, offline scope, platform priority | Changing any domain rule, enum, or lifecycle behavior         |
| [`product-spec.md`](./product-spec.md)   | Product scope, user flows, screen purposes, AI output contract                      | Deciding what a screen should do, or questioning scope        |

## Guides

| Doc                                                            | Role                                                                          | Read it when                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------- |
| [`theming-guide.md`](./theming-guide.md)                       | Unistyles v3 conventions, `appThemes` tokens, party-theme overrides           | Writing or changing any styling           |
| [`i18n-guide.md`](./i18n-guide.md)                             | Namespaces, key naming, adding strings, adding a locale, localizing AI output | Adding or changing any user-facing string |
| [`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md) | iOS simulator runbook and screen-by-screen QA checks for AI agents            | Verifying a change on a real simulator    |

## Planning

| Doc                                                  | Role                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| [`roadmap.md`](./roadmap.md)                         | Remaining work and explicit non-goals                         |
| [`discovery-questions.md`](./discovery-questions.md) | Open product and UX questions. Add scope questions here first |

## Conventions

- **Present tense, current state only.** No "previously / originally / no longer", no
  before-and-after notes, no drift tables, no "reduced from X to Y". Rewrite a doc to the new
  truth when code changes; do not annotate the old version.
- **Resolved items get deleted**, not marked resolved. History lives in git, not in docs.
- One topic per doc. Link rather than duplicate.
- Name a single source of truth per topic. `src/shared/constants/party-options.ts` and
  `src/shared/theme/unistyles.ts` beat any prose list of enums or colors.
- Code is the authority. There is no CI check that prose matches it, so correct docs as you work.
