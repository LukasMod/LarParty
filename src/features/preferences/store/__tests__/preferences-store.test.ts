import { usePreferencesStore } from '@/features/preferences/store/preferences-store'

const store = () => usePreferencesStore.getState()

beforeEach(() => {
  usePreferencesStore.setState({
    cardDisplayMode: 'collectible',
    languagePreference: 'system',
    hasHydrated: false,
  })
})

describe('defaults', () => {
  it('opens in collectible display mode', () => {
    expect(store().cardDisplayMode).toBe('collectible')
  })

  it('follows the system language until the user chooses', () => {
    expect(store().languagePreference).toBe('system')
  })

  it('starts without hydration so a cold read shows the restoring state', () => {
    expect(store().hasHydrated).toBe(false)
  })
})

describe('setters', () => {
  it('updates the language preference', () => {
    store().setLanguagePreference('pl')

    expect(store().languagePreference).toBe('pl')
  })

  it('updates the display mode', () => {
    store().setCardDisplayMode('info')

    expect(store().cardDisplayMode).toBe('info')
  })

  it('flips hasHydrated once rehydrated', () => {
    store().setHasHydrated(true)

    expect(store().hasHydrated).toBe(true)
  })
})
