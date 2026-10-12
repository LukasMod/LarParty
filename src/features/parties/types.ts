import {
  PartyMoodKey,
  StoredPartyMoodKey,
  themeCategories,
} from '@/shared/constants/party-options'

export type ThemeCategory = (typeof themeCategories)[number]
export type PartyMood = PartyMoodKey
export type StoredPartyMood = StoredPartyMoodKey

export interface Party {
  id: string
  title: string
  themeCategory: ThemeCategory
  mood: StoredPartyMood
  createdAt: string
  updatedAt: string
}

export interface CreatePartyInput {
  title: string
  themeCategory: ThemeCategory
  mood: PartyMood
}
