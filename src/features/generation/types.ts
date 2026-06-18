import { CharacterCardGenerated, CharacterCardInput } from '@/features/cards/types';
import { Party } from '@/features/parties/types';

export interface GenerateCharacterCardRequest {
  party: Party;
  input: CharacterCardInput;
}

export interface CharacterCardGenerator {
  generate(request: GenerateCharacterCardRequest): Promise<CharacterCardGenerated>;
}
