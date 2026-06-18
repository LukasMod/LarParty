import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CardDisplayMode } from '@/features/cards/types';
import { zustandStorage } from '@/shared/storage/zustand-storage';

interface PreferencesStoreState {
  hasHydrated: boolean;
  cardDisplayMode: CardDisplayMode;
  setCardDisplayMode: (cardDisplayMode: CardDisplayMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const usePreferencesStore = create<PreferencesStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      cardDisplayMode: 'collectible',
      setCardDisplayMode: (cardDisplayMode) => {
        set({ cardDisplayMode });
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
