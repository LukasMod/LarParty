import { withAlpha } from '@/shared/theme/alpha'

describe('withAlpha', () => {
  it('converts a six digit hex color to rgba', () => {
    expect(withAlpha('#B58CFF', 0.5)).toBe('rgba(181, 140, 255, 0.5)')
  })

  it('handles all-channels-zero color', () => {
    expect(withAlpha('#000000', 1)).toBe('rgba(0, 0, 0, 1)')
  })

  it('handles max channels', () => {
    expect(withAlpha('#FFFFFF', 0)).toBe('rgba(255, 255, 255, 0)')
  })

  it('parses uppercase and lowercase hex identically', () => {
    expect(withAlpha('#36D5F5', 0.4)).toBe(withAlpha('#36d5f5', 0.4))
  })

  it('passes the alpha through untouched', () => {
    expect(withAlpha('#D94A55', 0.22)).toBe('rgba(217, 74, 85, 0.22)')
  })

  it('does not clamp an out-of-range alpha', () => {
    expect(withAlpha('#E8D3B0', 2)).toBe('rgba(232, 211, 176, 2)')
  })

  it('mis-parses a shorthand hex instead of expanding it', () => {
    expect(withAlpha('#fff', 1)).toBe('rgba(255, 15, NaN, 1)')
  })

  it('produces garbage channels when the leading hash is missing', () => {
    expect(withAlpha('B58CFF', 1)).toBe('rgba(88, 207, 15, 1)')
  })
})
