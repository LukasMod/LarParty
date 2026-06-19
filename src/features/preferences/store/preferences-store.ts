import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { CardDisplayMode } from '@/features/cards/types'
import { LanguagePreference } from '@/shared/i18n/locale'
import { zustandStorage } from '@/shared/storage/zustand-storage'

interface PreferencesStoreState {
  hasHydrated: boolean
  cardDisplayMode: CardDisplayMode
  languagePreference: LanguagePreference
  setCardDisplayMode: (cardDisplayMode: CardDisplayMode) => void
  setLanguagePreference: (languagePreference: LanguagePreference) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const usePreferencesStore = create<PreferencesStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      cardDisplayMode: 'collectible',
      languagePreference: 'system',
      setCardDisplayMode: (cardDisplayMode) => {
        set({ cardDisplayMode })
      },
      setLanguagePreference: (languagePreference) => {
        set({ languagePreference })
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated })
      },
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
