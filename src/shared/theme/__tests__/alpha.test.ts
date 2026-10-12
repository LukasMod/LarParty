import { withAlpha } from '@/shared/theme/alpha'

describe('withAlpha', () => {
  it('converts a six digit hex color to rgba', () => {
    expect(withAlpha('#B58CFF', 0.5)).toBe('rgba(181, 140, 255, 0.5)')
  })

  // Themes only use #RRGGBB, but these two landmines mis-parse silently rather
  // than throw, so they stay pinned: a shorthand or hash-less string yields
  // wrong channels instead of an error.
  it('mis-parses a shorthand hex instead of expanding it', () => {
    expect(withAlpha('#fff', 1)).toBe('rgba(255, 15, NaN, 1)')
  })

  it('produces garbage channels when the leading hash is missing', () => {
    expect(withAlpha('B58CFF', 1)).toBe('rgba(88, 207, 15, 1)')
  })
})
