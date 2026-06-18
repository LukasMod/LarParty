import { cardDisplayModes, cardTraits, sexOptions } from '@/shared/constants/party-options';

export type InputTrait = (typeof cardTraits)[number];
export type SexOption = (typeof sexOptions)[number];
export type CardStatus = 'draft' | 'accepted';
export type CardDisplayMode = (typeof cardDisplayModes)[number];

export interface CharacterCardInput {
  name: string;
  sex: SexOption;
  age: number;
  selectedTraits: InputTrait[];
}

export interface CharacterCardGenerated {
  generatedNameWithClass: string;
  backgroundHistory: string;
  characterTraits: [string, string, string];
  specialMovement: string;
  specialPhrase: string;
}

export interface CharacterCard {
  id: string;
  partyId: string;
  status: CardStatus;
  input: CharacterCardInput;
  generated: CharacterCardGenerated;
  generationGroupId: string;
  basedOnCardId?: string;
  createdAt: string;
  updatedAt: string;
}
