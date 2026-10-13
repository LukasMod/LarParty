import { partyMoods, themeCategories } from '@/shared/constants/party-options'

export type ThemeCategory = (typeof themeCategories)[number]
export type PartyMood = (typeof partyMoods)[number]

export interface Party {
  id: string
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
  // Shared world text written once, by the first generated card, and reused by
  // every later card so the party's characters inhabit one history.
  partyHistory?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePartyInput {
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
}
