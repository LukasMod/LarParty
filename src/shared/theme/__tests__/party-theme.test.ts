import { themeCategories } from '@/shared/constants/party-options'
import { getPartyTheme } from '@/shared/theme/party-theme'
import { appThemes, partyThemeNames } from '@/shared/theme/unistyles'

// The palette itself is checked by `npm run contrast`. What is unique here is
// the category-to-theme wiring, which TypeScript cannot catch: a Record can
// point a category at the wrong existing theme.

describe('getPartyTheme', () => {
  it('resolves each category to the theme of the same name', () => {
    for (const category of themeCategories) {
      expect(getPartyTheme(category)).toBe(appThemes[category])
    }
  })

  it('gives every party theme a distinct primary color', () => {
    const primaries = themeCategories.map(
      (category) => getPartyTheme(category).colors.primary,
    )

    expect(new Set(primaries).size).toBe(primaries.length)
  })

  // themeCategories and partyThemeNames are two independent literal lists in
  // separate files, so nothing at compile time keeps them aligned.
  it('covers every party theme name so the record cannot go stale', () => {
    expect(themeCategories).toEqual(partyThemeNames)
  })
})
