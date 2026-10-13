import { levelLabel } from '@/shared/utils/level'

describe('levelLabel', () => {
  it('prefixes a positive level with +', () => {
    expect(levelLabel(1)).toBe('+1')
    expect(levelLabel(3)).toBe('+3')
  })

  it('renders zero bare', () => {
    expect(levelLabel(0)).toBe('0')
  })

  it('renders a negative level with its own minus', () => {
    expect(levelLabel(-2)).toBe('-2')
  })
})
