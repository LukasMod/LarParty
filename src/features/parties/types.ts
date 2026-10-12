import { partyMoods, themeCategories } from '@/shared/constants/party-options'

export type ThemeCategory = (typeof themeCategories)[number]
export type PartyMood = (typeof partyMoods)[number]

export interface Party {
  id: string
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
  createdAt: string
  updatedAt: string
}

export interface CreatePartyInput {
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
}
