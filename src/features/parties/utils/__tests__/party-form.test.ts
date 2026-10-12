import {
  isPartyTitleValid,
  shouldClearPartyTitleError,
} from '@/features/parties/utils/party-form'

describe('isPartyTitleValid', () => {
  it('accepts a real title', () => {
    expect(isPartyTitleValid('Emberkeep')).toBe(true)
  })

  it('accepts a padded title', () => {
    expect(isPartyTitleValid('  Emberkeep  ')).toBe(true)
  })

  // Whitespace-only is the case a plain `title !== ''` check lets through.
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
})
