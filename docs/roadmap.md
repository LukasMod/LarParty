# Roadmap

Remaining work, ordered by value. Each item is scoped small enough for its own PR.

## Open work

1. **Card display-mode switching.**
   - Wiring: `src/app/party/[partyId]/card/[cardId].tsx` passes a fixed
     `displayMode="collectible"` and does not mount `CardDisplayModeSwitch`, so the
     `cardDisplayMode` preference has no effect.
   - Design: `character-card-view.tsx` renders both modes as the same section list, differing
     only by surface color and border width. A distinct, readable info layout is not built, so
     wiring the toggle alone yields a near-identical card. Either build the info layout or
     remove the feature and the preference. Decide first in
     [`discovery-questions.md`](./discovery-questions.md).
2. **Translated generation errors.** Catch blocks surface `error.message` raw, so offline and
   provider failures show untranslated SDK text even in Polish. Generation requires
   connectivity, so the offline failure is a common path. Map failures to translated keys and
   keep `error.message` for logs. See
   [`architecture.md`](./architecture.md#dead-code-and-hazards).
3. **Typecheck errors.** `npm run check` fails with 15 i18n typing errors on a clean
   checkout. Root cause and a verified 2-file fix are in
   [`architecture.md`](./architecture.md#npm-run-typecheck-fails-on-a-clean-checkout).
4. **Dead starter code.** Remove `src/components/*` (keep `themed-text`/`themed-view`), unused
   hooks in `src/hooks/`, and the orphaned `/explore` route. `constants/theme.ts` keeps `Colors`
   (live) alongside `Fonts`/`Radius`/`MaxContentWidth` that only dead code imports. Full
   inventory, including what must _not_ be deleted, in
   [`architecture.md`](./architecture.md#dead-code-and-hazards). Also remove the `console.log`
   in `settings.tsx` and the redundant `useMemo` in `card/new.tsx`.
5. **`README.md`.** Replace the default Expo template content. It instructs readers to run
   `npm run reset-project`, which moves `src/` and `scripts/` into `example/` and removes the
   app. It also omits `EXPO_PUBLIC_GEMINI_API_KEY`, without which generation throws on first
   use. Write real setup, commands, and API-key steps; drop or guard the `reset-project` script.
6. **Test runner.** No CI and no tests exist, so `agent-device` smoke tests are the only
   regression net. Start with pure, UI-free seams: card selectors, generation schema parsing,
   form validation rules, cascade-delete store logic. Add an i18n key-coverage test comparing
   `en` and `pl`, normalizing plural suffixes first — Polish has `_few`/`_many` keys English
   lacks (see [`i18n-guide.md`](./i18n-guide.md#plurals)), so a raw key-set diff reports false
   failures.

## Verification gaps

The full flow is code-complete and passed one iOS simulator pass
([`agent-device-smoke-tests.md`](./agent-device-smoke-tests.md)). No automated suite or CI
exists. Android and web have no smoke coverage.

## Non-goals

- Local/on-device LLM. Generation is remote Gemini only.
- Backend sync, auth, payments, notifications.
- Partial editing of accepted cards.
- Web parity beyond "it runs". Mobile-first per `mvp-decisions.md`.
