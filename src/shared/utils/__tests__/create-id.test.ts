import { createId } from '@/shared/utils/create-id'

describe('createId', () => {
  it('prefixes the uuid', () => {
    expect(createId('party')).toMatch(/^party-[0-9a-f-]+$/)
  })

  it('produces a valid v4 uuid after the prefix', () => {
    const uuid = createId('card').slice('card-'.length)

    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('returns a fresh id on every call', () => {
    expect(createId('card')).not.toBe(createId('card'))
  })

  it('keeps prefixes distinguishable', () => {
    expect(createId('party').startsWith('card-')).toBe(false)
  })
})
