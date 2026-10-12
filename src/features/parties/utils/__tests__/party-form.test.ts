import {
  isPartyTitleValid,
  normalizePartyTitle,
  shouldClearPartyTitleError,
} from '@/features/parties/utils/party-form'

describe('normalizePartyTitle', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizePartyTitle('  Emberkeep ')).toBe('Emberkeep')
  })

  it('collapses to empty for whitespace-only input', () => {
    expect(normalizePartyTitle(' \n\t ')).toBe('')
  })

  it('keeps inner whitespace', () => {
    expect(normalizePartyTitle('Mistmoor  Vale')).toBe('Mistmoor  Vale')
  })
})

describe('isPartyTitleValid', () => {
  it('accepts a real title', () => {
    expect(isPartyTitleValid('Emberkeep')).toBe(true)
  })

  it('accepts a padded title', () => {
    expect(isPartyTitleValid('  Emberkeep  ')).toBe(true)
  })

  it('rejects an empty title', () => {
    expect(isPartyTitleValid('')).toBe(false)
  })

  it('rejects a whitespace-only title', () => {
    expect(isPartyTitleValid('   ')).toBe(false)
  })
})

describe('shouldClearPartyTitleError', () => {
  it('keeps the error hidden while nothing is showing', () => {
    expect(shouldClearPartyTitleError(false, 'Emberkeep')).toBe(false)
  })

  it('clears once the error shows and the title is usable', () => {
    expect(shouldClearPartyTitleError(true, 'Emberkeep')).toBe(true)
  })

  it('keeps the error while the title is still blank', () => {
    expect(shouldClearPartyTitleError(true, '   ')).toBe(false)
  })

  it('does not surface an error on its own', () => {
    expect(shouldClearPartyTitleError(false, '')).toBe(false)
  })
})
