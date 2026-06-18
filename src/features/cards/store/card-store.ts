import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CharacterCard } from '@/features/cards/types';
import { zustandStorage } from '@/shared/storage/zustand-storage';

interface CardStoreState {
  hasHydrated: boolean;
  cards: CharacterCard[];
  deleteCard: (cardId: string) => void;
  deleteCardsForParty: (partyId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useCardStore = create<CardStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      cards: [],
      deleteCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
        }));
      },
      deleteCardsForParty: (partyId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.partyId !== partyId),
        }));
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: 'card-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
