import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  CharacterCard,
  CharacterCardGenerated,
  CharacterCardInput,
} from '@/features/cards/types'
import { zustandStorage } from '@/shared/storage/zustand-storage'
import { createId } from '@/shared/utils/create-id'

interface CreateDraftCardInput {
  partyId: string
  input: CharacterCardInput
  generated: CharacterCardGenerated
  basedOnCardId?: string
  generationGroupId?: string
}

interface CardStoreState {
  hasHydrated: boolean
  cards: CharacterCard[]
  acceptCard: (cardId: string) => void
  createDraftCard: (input: CreateDraftCardInput) => string
  deleteCard: (cardId: string) => void
  deleteCardsForParty: (partyId: string) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useCardStore = create<CardStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      cards: [],
      acceptCard: (cardId) => {
        const timestamp = new Date().toISOString()

        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  status: 'accepted',
                  updatedAt: timestamp,
                }
              : card,
          ),
        }))
      },
      createDraftCard: (input) => {
        const timestamp = new Date().toISOString()
        const cardId = createId('card')
        const generationGroupId =
          input.generationGroupId ?? createId('generation')

        set((state) => ({
          cards: [
            {
              id: cardId,
              partyId: input.partyId,
              status: 'draft',
              input: input.input,
              generated: input.generated,
              generationGroupId,
              basedOnCardId: input.basedOnCardId,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.cards,
          ],
        }))

        return cardId
      },
      deleteCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
        }))
      },
      deleteCardsForParty: (partyId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.partyId !== partyId),
        }))
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated })
      },
    }),
    {
      name: 'card-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
