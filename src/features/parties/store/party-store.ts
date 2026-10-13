import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { useCardStore } from '@/features/cards/store/card-store'
import { CreatePartyInput, Party } from '@/features/parties/types'
import { zustandStorage } from '@/shared/storage/zustand-storage'
import { createId } from '@/shared/utils/create-id'

interface PartyStoreState {
  hasHydrated: boolean
  parties: Party[]
  createParty: (input: CreatePartyInput) => string
  // First write wins: the party's world is set by the first card and later
  // generations reuse it instead of inventing a rival history.
  setPartyHistory: (partyId: string, partyHistory: string) => void
  deleteParty: (partyId: string) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const usePartyStore = create<PartyStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      parties: [],
      createParty: (input) => {
        const timestamp = new Date().toISOString()
        const partyId = createId('party')

        set((state) => ({
          parties: [
            {
              id: partyId,
              title: input.title.trim(),
              themeCategory: input.themeCategory,
              mood: input.mood,
              partyHistory: null,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.parties,
          ],
        }))

        return partyId
      },
      setPartyHistory: (partyId, partyHistory) => {
        const timestamp = new Date().toISOString()

        set((state) => ({
          parties: state.parties.map((party) =>
            party.id === partyId && !party.partyHistory
              ? {
                  ...party,
                  partyHistory,
                  updatedAt: timestamp,
                }
              : party,
          ),
        }))
      },
      deleteParty: (partyId) => {
        set((state) => ({
          parties: state.parties.filter((party) => party.id !== partyId),
        }))
        useCardStore.getState().deleteCardsForParty(partyId)
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated })
      },
    }),
    {
      name: 'party-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
