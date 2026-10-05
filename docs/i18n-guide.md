# i18n Guide

English and Polish ship today. Translation is compile-time only: all strings are
bundled in JS, nothing is fetched or loaded from disk.

## Stack

- `i18next` + `react-i18next`, via a dedicated instance (not the global default)
- `expo-localization` for the device language
- `intl-pluralrules` polyfill, imported first in `src/shared/i18n/index.ts`
- `compatibilityJSON: 'v4'` — plurals run through the polyfill, not Intl.PluralRules
- Fallback language: `en`. Unsupported device languages resolve to `en`

## File map

| Path                                  | Role                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/shared/i18n/index.ts`            | Creates the instance and initializes it. Imported once for side effects in `src/app/_layout.tsx` |
| `src/shared/i18n/resources.ts`        | Registers locales and the default namespace. `AppResources` type feeds `i18next.d.ts`            |
| `src/shared/i18n/locales/en.ts`       | English strings, one object per namespace                                                        |
| `src/shared/i18n/locales/pl.ts`       | Polish strings, same shape                                                                       |
| `src/shared/i18n/locale.ts`           | Supported codes, device-language resolution                                                      |
| `src/shared/i18n/use-app-language.ts` | Applies the language preference to the i18n instance                                             |
| `src/shared/i18n/labels.ts`           | Translated labels for the enum options in `party-options.ts`                                     |
| `src/shared/i18n/generation.ts`       | Localizes AI prompt input and pins AI output language                                            |

## Namespaces

`common` is the default namespace (`defaultNS` in `resources.ts`). The others are opt-in.

| Namespace  | Contents                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `common`   | Actions, statuses, screen titles, loading/empty states, `options.*` enum labels, `counts.*` plurals, language names |
| `home`     | Party list subtitle and empty state                                                                                 |
| `parties`  | Party form and party delete dialog                                                                                  |
| `cards`    | Card form, errors, card sections, card dialogs                                                                      |
| `settings` | Language preference UI                                                                                              |

Screen titles are translated in `src/app/_layout.tsx`, where each `Stack.Screen` option
calls `t('screens.*')`.

## Adding a string

1. Add the key to **both** `locales/en.ts` and `locales/pl.ts`. `i18next.d.ts` types
   `t()` against the `en` object, so a typo'd or absent English key is a type error — but
   a key present in `en` and **missing in `pl` is invisible to the compiler** and silently
   falls back to English at runtime.
2. Add only to the namespace that owns the screen or domain. Put genuinely shared
   strings in `common`.
3. In the component, request the namespaces you need and qualify cross-namespace keys:

```tsx
const { t } = useTranslation(['common', 'cards'])

t('actions.cancel') // common is default, no prefix needed
t('cards:form.nameLabel') // other namespaces must be qualified
```

4. Keep the shape as flat as is reasonable. Interpolation uses `{{name}}` and stays
   identical across locales.

## Key naming

- `actions.*` — button and menu labels
- `status.*` — card status badges
- `screens.*` — navigation titles
- `state.*` — loading / not-found / restoring copy
- `options.<enumKey>.<value>` — labels for values in `party-options.ts`
- `counts.*` — pluralized counters
- Per-namespace: `form.*`, `sections.*`, `details.*`, with `errors.*` nested under `form`

Dialogs are `*Title` + `*Body` pairs, passed to `Alert.alert`.

## Enum option labels

The `*Labels` records in `src/shared/constants/party-options.ts` are **not used by the
UI** — they exist as reference data. Translated labels come from `src/shared/i18n/labels.ts`
via keys in the `common` namespace under `options.*`. Below, `common:options.*` means
"namespace `common`, path `options.*`" — pass those keys to `t()` **bare**, without the
`common:` prefix (see Caveats).

When adding an option to any enum in `party-options.ts`:

1. Add the value to the `as const` array.
2. Add its English and Polish label under `options.*` in the `common` namespace of both
   locale files.
3. Add it to the matching `*Labels` record in `party-options.ts` — TypeScript requires it.

`labels.ts` derives its argument types from the arrays, so a new value breaks the build
until the label keys exist in the locale objects.

## Plurals

Plurals use i18next suffixes. English needs `_one` and `_other`. Polish needs `_one`,
`_few`, `_many`, and `_other`. So the two locale files have **intentionally different
key sets** under `counts.*` — a diff tool that reports extra Polish plural forms as
"missing in English" is wrong.

```ts
counts: {
  cards_one: '{{count}} card',
  cards_other: '{{count}} cards',
}
```

```tsx
t('counts.cards', { count: cardCount })
```

## Adding a locale

1. Create `src/shared/i18n/locales/<code>.ts` mirroring `en.ts` exactly, including all
   namespace keys.
2. Register it in `resources.ts`.
3. Add the code to `supportedLanguageCodes` in `locale.ts`.
4. Add the language name under `languages.*` in **every** locale file.
5. Add the code to `languageNames` in `generation.ts` or AI generation for that locale
   throws.

`resolveLanguageFromTag` matches on the part of the device tag before the first `-`, so
`pl-PL` and `en-GB` resolve without extra work.

## Language preference

The preference lives in the persisted preferences store
(`src/features/preferences/store/preferences-store.ts`), defaulting to `system`. It is
not an i18next concern: `useAppLanguage()` resolves `system` against the device locale
and calls `i18n.changeLanguage()` when the result changes.

`useAppLanguage()` returns `resolvedLanguage`, which is what generation needs. The
Settings screen is the only UI that writes the preference.

## Localizing AI output

Generated card content follows the **resolved app language**, not the language of the
form input. Two pieces make this work:

- `getGenerationLanguageName()` maps the code to an English language name, which the
  prompt passes as "Write all generated field values in Polish".
- `getGenerationTranslator()` builds a translator over a specific locale's `common`
  resource, so prompt labels for theme, mood, sex, and traits are localized independently
  of the active UI language.
- `prompt.ts` instructs the model to keep JSON schema keys in English and localize only
  the string values.

The schema keys themselves (`generatedNameWithClass`, `backgroundHistory`,
`characterTraits`, `specialMovement`, `specialPhrase`) are never localized. See
`src/features/generation/schemas.ts`.

## Caveats

- **A `common:`-prefixed key is a type error whenever `t` is typed to a single
  namespace.** i18next 26 custom types accept an `ns:` prefix only when the `t` knows about
  two or more namespaces. So `t('common:options.sex.male')` compiles inside a component
  using `useTranslation(['common', 'cards'])`, but is rejected as an unknown key when `t`
  is a single-namespace `t`. Rejected calls return `unknown`, which then fails every
  downstream `string`. This is exactly the trap in `labels.ts`, whose helpers take a bare
  `TFunction` (which resolves to the `defaultNS`, i.e. `common`) and prefix everything with
  `common:` — the cause of the pre-existing typecheck failure in
  [`architecture.md`](./architecture.md#npm-run-typecheck-fails-on-a-clean-checkout).
  Safe rule: **write `common` keys bare** — `t('options.sex.male')`, not
  `t('common:options.sex.male')`. Non-default namespaces always take their prefix:
  `t('cards:form.title')`. Prefer
  `TFunction<'common'>` for these helpers.
- Strings in `Alert.alert`, `Stack.Screen` options, and `accessibilityLabel` all need
  `t()`. New screens added without `useTranslation` will render raw English literals.
- `getGenerationTranslator` does dotted-path lookup with a `key` fallback. A missing
  prompt label yields the key string in the prompt rather than an error, so check the
  prompt output when touching option enums.
- Polish has **more** plural keys than English by design (`_few`, `_many`). Do not
  "sync" them.
