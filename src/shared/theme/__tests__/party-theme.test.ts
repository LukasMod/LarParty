import { themeCategories } from '@/shared/constants/party-options'
import { getPartyTheme } from '@/shared/theme/party-theme'
import { appThemes, partyThemeNames } from '@/shared/theme/unistyles'

describe('getPartyTheme', () => {
  it('returns a theme for every party category', () => {
    for (const category of themeCategories) {
      expect(getPartyTheme(category)).toBeDefined()
    }
  })

  it('maps each category to its own theme object', () => {
    const themes = themeCategories.map((category) => getPartyTheme(category))

    expect(new Set(themes).size).toBe(themeCategories.length)
  })

  it('resolves to the named app theme', () => {
    for (const category of themeCategories) {
      expect(getPartyTheme(category)).toBe(appThemes[category])
    }
  })

  it('never hands back the default theme', () => {
    for (const category of themeCategories) {
      expect(getPartyTheme(category)).not.toBe(appThemes.default)
    }
  })

  it('covers every party theme name so the record cannot go stale', () => {
    expect(themeCategories).toEqual(partyThemeNames)
  })

  it('keeps the shared neutral base across party themes', () => {
    const bases = themeCategories.map((category) => {
      const { colors } = getPartyTheme(category)

      return {
        text: colors.text,
        textSecondary: colors.textSecondary,
        background: colors.background,
      }
    })
    const [first] = bases

    for (const base of bases) {
      expect(base).toEqual(first)
    }
  })

  it('gives every party theme a distinct primary color', () => {
    const primaries = themeCategories.map(
      (category) => getPartyTheme(category).colors.primary,
    )

    expect(new Set(primaries).size).toBe(primaries.length)
  })
})
