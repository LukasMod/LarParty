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
  signal?: AbortSignal
}

export interface CharacterCardGenerator {
  generate(
    request: GenerateCharacterCardRequest,
  ): Promise<CharacterCardGenerated>
}
