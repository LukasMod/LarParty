import { zustandStorage } from '@/shared/storage/zustand-storage'
import { storage } from '@/shared/storage/mmkv'

describe('zustandStorage', () => {
  beforeEach(() => {
    storage.clearAll()
  })

  it('round-trips a value', () => {
    zustandStorage.setItem('card-store', '{"state":{}}')

    expect(zustandStorage.getItem('card-store')).toBe('{"state":{}}')
  })

  it('returns null for a missing key rather than undefined', () => {
    expect(zustandStorage.getItem('missing')).toBeNull()
  })

  it('removes a key', () => {
    zustandStorage.setItem('card-store', 'value')
    zustandStorage.removeItem('card-store')

    expect(zustandStorage.getItem('card-store')).toBeNull()
  })

  it('removing a missing key does not throw', () => {
    expect(() => zustandStorage.removeItem('missing')).not.toThrow()
  })

  // `?? null` rather than `|| null`: a stored empty string must survive a
  // reload, or Zustand treats a persisted empty payload as "nothing stored".
  it('reads back an empty string as itself, not null', () => {
    zustandStorage.setItem('empty-store', '')

    expect(zustandStorage.getItem('empty-store')).toBe('')
  })
})
