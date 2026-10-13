import {
  CharacterCardGenerated,
  CharacterCardInput,
  InputTrait,
} from '@/features/cards/types'
import { Party } from '@/features/parties/types'
import { SupportedLanguageCode } from '@/shared/i18n/locale'

export interface PromptSeedTrait {
  trait: InputTrait
  traitValue: number
}

export interface PromptSiblingCard {
  nameWithClass: string
  traits: PromptSeedTrait[]
  specialPhrase: string
  specialMovement: string
}

export interface GenerateCharacterCardRequest {
  party: Party
  input: CharacterCardInput
  outputLanguage: SupportedLanguageCode
  attempt?: number
  seedTraits?: PromptSeedTrait[]
  siblings?: PromptSiblingCard[]
  // The party's established world. Absent until the first card founds one, which
  // is what makes that card also generate the shared `partyHistory`.
  partyHistory?: string | null
  signal?: AbortSignal
}

// The first card of a party answers `partyHistory` alongside the card fields.
// Callers strip it before saving, so it lives on the party rather than the card.
export interface GeneratedCharacterCard extends CharacterCardGenerated {
  partyHistory?: string
}

export interface CharacterCardGenerator {
  generate(
    request: GenerateCharacterCardRequest,
  ): Promise<GeneratedCharacterCard>
}
