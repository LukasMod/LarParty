import { i18n } from '@/shared/i18n/index'
import { SupportedLanguageCode } from '@/shared/i18n/locale'
import {
  getCardDisplayModeLabel,
  getCardTraitLabel,
  getPartyMoodLabel,
  getSexOptionLabel,
  getThemeCategoryLabel,
} from '@/shared/i18n/labels'
import {
  cardDisplayModes,
  cardTraits,
  partyMoods,
  sexOptions,
  themeCategories,
} from '@/shared/constants/party-options'

// A missing Polish key silently falls back to English, so every enum value in
// every supported language needs its own entry. i18next returns the key itself
// when it cannot resolve one, which is what these assert against.
describe.each<SupportedLanguageCode>(['en', 'pl'])(
  'enum labels (%s)',
  (language) => {
    const t = i18n.getFixedT(language)

    it('resolves every theme category', () => {
      for (const value of themeCategories) {
        expect(getThemeCategoryLabel(t, value)).not.toBe(
          `common:options.themeCategory.${value}`,
        )
      }
    })

    it('resolves every party mood', () => {
      for (const value of partyMoods) {
        expect(getPartyMoodLabel(t, value)).not.toBe(
          `common:options.partyMood.${value}`,
        )
      }
    })

    it('resolves every card trait', () => {
      for (const value of cardTraits) {
        expect(getCardTraitLabel(t, value)).not.toBe(
          `common:options.cardTrait.${value}`,
        )
      }
    })

    it('resolves every sex option', () => {
      for (const value of sexOptions) {
        expect(getSexOptionLabel(t, value)).not.toBe(
          `common:options.sex.${value}`,
        )
      }
    })

    it('resolves every card display mode', () => {
      for (const value of cardDisplayModes) {
        expect(getCardDisplayModeLabel(t, value)).not.toBe(
          `common:options.cardDisplayMode.${value}`,
        )
      }
    })
  },
)

describe('label text', () => {
  // Two enum values sharing a label is invisible in the UI until someone reads
  // the trait chips side by side.
  it('gives each trait and mood its own English label', () => {
    const t = i18n.getFixedT('en')

    expect(
      new Set(cardTraits.map((value) => getCardTraitLabel(t, value))).size,
    ).toBe(cardTraits.length)
    expect(
      new Set(partyMoods.map((value) => getPartyMoodLabel(t, value))).size,
    ).toBe(partyMoods.length)
  })

  // Guards the fallback path above: if Polish were empty, the resolution test
  // would still pass because English answers the lookup.
  it('does not leave Polish traits in English', () => {
    const en = cardTraits.map((value) =>
      getCardTraitLabel(i18n.getFixedT('en'), value),
    )
    const pl = cardTraits.map((value) =>
      getCardTraitLabel(i18n.getFixedT('pl'), value),
    )

    expect(pl).not.toEqual(en)
  })
})
