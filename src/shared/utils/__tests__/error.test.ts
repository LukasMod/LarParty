import { resolveErrorMessage } from '@/shared/utils/error'

describe('resolveErrorMessage', () => {
  it('surfaces an Error message', () => {
    expect(
      resolveErrorMessage(new Error('Gemini timed out.'), 'fallback'),
    ).toBe('Gemini timed out.')
  })

  it('falls back for an Error with an empty message', () => {
    expect(resolveErrorMessage(new Error(), 'fallback')).toBe('fallback')
  })

  it('falls back for a thrown string', () => {
    expect(resolveErrorMessage('boom', 'fallback')).toBe('fallback')
  })

  it('falls back for undefined', () => {
    expect(resolveErrorMessage(undefined, 'fallback')).toBe('fallback')
  })

  // Guards against "simplifying" the check to a duck-typed `error.message` read.
  it('falls back for a plain object carrying a message', () => {
    expect(resolveErrorMessage({ message: 'boom' }, 'fallback')).toBe(
      'fallback',
    )
  })

  // The Gemini SDK throws ApiError, so subclasses must keep their message.
  it('keeps a message from an Error subclass', () => {
    class GenerationError extends Error {}

    expect(
      resolveErrorMessage(new GenerationError('bad key'), 'fallback'),
    ).toBe('bad key')
  })
})
