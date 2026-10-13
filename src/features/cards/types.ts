import {
  cardDisplayModes,
  cardTraits,
  sexOptions,
} from '@/shared/constants/party-options'

export type InputTrait = (typeof cardTraits)[number]
export type SexOption = (typeof sexOptions)[number]
export type CardStatus = 'draft' | 'accepted'
export type CardDisplayMode = (typeof cardDisplayModes)[number]

// A signed -3…+3 intensity per selected trait, stored sparsely: a trait the
// user never tuned is absent and reads as the 0 default. Optional on the input
// so cards saved before the intensity control parse unchanged.
export type TraitLevels = Partial<Record<InputTrait, number>>

export interface CharacterCardInput {
  name: string
  sex: SexOption
  selectedTraits: InputTrait[]
  traitLevels?: TraitLevels
}

export interface CharacterCardGenerated {
  generatedNameWithClass: string
  backgroundHistory: string
  characterTraits: [string, string, string]
  specialMovement: string
  specialPhrase: string
}

export interface CharacterCard {
  id: string
  partyId: string
  status: CardStatus
  input: CharacterCardInput
  generated: CharacterCardGenerated
  generationGroupId: string
  basedOnCardId?: string
  createdAt: string
  updatedAt: string
}
