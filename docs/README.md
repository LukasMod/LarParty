# Documentation Map

Start with `../CLAUDE.md` for the short version of how the app is built. This index
says what each doc is for and how much to trust it.

## Read first

| Doc                                                  | Role                                                                                                                                                           | Read it when                                                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`architecture.md`](./architecture.md)               | **How the code is today**: layout, screen-model pattern, stores, generation flow, dead code, known build failures                                              | Before any code change. Start here if you are new to the repo                                                        |
| [`mvp-decisions.md`](./mvp-decisions.md)             | Frozen domain rules: enums, card lifecycle, regeneration, offline scope, platform priority                                                                     | Changing any domain rule, enum, or lifecycle behavior                                                                |
| [`product-spec.md`](./product-spec.md)               | Product scope, user flows, screen purposes, AI output contract                                                                                                 | Deciding what a screen should do, or questioning scope                                                               |
| [`implementation-plan.md`](./implementation-plan.md) | **Current Status** section is the live forward plan. Below it: original architecture rationale — folder layout, route plan, domain model, persistence strategy | Picking up work, or adding a feature module, route, or store. Its header lists where the historical part has drifted |

## Working guides

| Doc                                                            | Role                                                                          | Read it when                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------- |
| [`theming-guide.md`](./theming-guide.md)                       | Unistyles v3 conventions, `appThemes` tokens, party-theme overrides           | Writing or changing any styling           |
| [`i18n-guide.md`](./i18n-guide.md)                             | Namespaces, key naming, adding strings, adding a locale, localizing AI output | Adding or changing any user-facing string |
| [`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md) | iOS simulator runbook and screen-by-screen QA checks for AI agents            | Verifying a change on a real simulator    |

## Open questions

| Doc                                                  | Role                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| [`discovery-questions.md`](./discovery-questions.md) | Unresolved product and UX questions. Update before scope changes |

## Archive

| Doc                                        | Role                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| [`archive/README.md`](./archive/README.md) | Planning-era artifacts kept for history. Do not implement from these |

## Conventions

- One topic per doc. Link rather than duplicate.
- Name a single source of truth per topic and point at it. `src/shared/constants/party-options.ts`
  and `src/shared/theme/unistyles.ts` beat any prose list of enums or colors.
- Living docs state present tense. If you ship something a doc described as future,
  rewrite the doc.
- Docs drift silently. There is no CI check that prose matches code, so treat code as
  the authority and correct docs as you work.
