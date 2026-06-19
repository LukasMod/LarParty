import {
  CharacterCardGenerated,
  CharacterCardInput,
} from '@/features/cards/types'
import { Party } from '@/features/parties/types'
import { SupportedLanguageCode } from '@/shared/i18n/locale'

export interface GenerateCharacterCardRequest {
  party: Party
  input: CharacterCardInput
  outputLanguage: SupportedLanguageCode
}

export interface CharacterCardGenerator {
  generate(
    request: GenerateCharacterCardRequest,
  ): Promise<CharacterCardGenerated>
}
