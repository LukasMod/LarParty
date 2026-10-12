import { i18n } from '@/shared/i18n/index'
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
// every supported language needs its own entry.
describe.each([
  ['en', themeCategories],
  ['pl', themeCategories],
])('theme category labels (%s)', (language, values) => {
  it('resolves every theme category', () => {
    const t = i18n.getFixedT(language)

    for (const value of values) {
      expect(getThemeCategoryLabel(t, value)).not.toBe(
        `options.themeCategory.${value}`,
      )
    }
  })
})

describe.each(['en', 'pl'])('enum labels (%s)', (language) => {
  const t = i18n.getFixedT(language)

  it('resolves every party mood', () => {
    for (const value of partyMoods) {
      expect(getPartyMoodLabel(t, value)).not.toBe(
        `options.partyMood.${value}`,
      )
    }
  })

  it('resolves every card trait', () => {
    for (const value of cardTraits) {
      expect(getCardTraitLabel(t, value)).not.toBe(
        `options.cardTrait.${value}`,
      )
    }
  })

  it('resolves every sex option', () => {
    for (const value of sexOptions) {
      expect(getSexOptionLabel(t, value)).not.toBe(
        `options.sex.${value}`,
      )
    }
  })

  it('resolves every card display mode', () => {
    for (const value of cardDisplayModes) {
      expect(getCardDisplayModeLabel(t, value)).not.toBe(
        `options.cardDisplayMode.${value}`,
      )
    }
  })
})

describe('label text', () => {
  it('never returns a blank label', () => {
    const t = i18n.getFixedT('en')

    for (const value of cardTraits) {
      expect(String(getCardTraitLabel(t, value)).trim().length).toBeGreaterThan(
        0,
      )
    }
  })

  it('gives each trait its own English label', () => {
    const t = i18n.getFixedT('en')
    const labels = cardTraits.map((value) => getCardTraitLabel(t, value))

    expect(new Set(labels).size).toBe(cardTraits.length)
  })

  it('gives each mood its own English label', () => {
    const t = i18n.getFixedT('en')
    const labels = partyMoods.map((value) => getPartyMoodLabel(t, value))

    expect(new Set(labels).size).toBe(partyMoods.length)
  })

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
