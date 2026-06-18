import {
  cardTraitLabels,
  partyMoodLabels,
  sexOptionLabels,
  themeCategoryLabels,
} from '@/shared/constants/party-options'

import { GenerateCharacterCardRequest } from '@/features/generation/types'

export function buildCharacterCardPrompt({
  party,
  input,
}: GenerateCharacterCardRequest) {
  const selectedTraits = input.selectedTraits
    .map((trait) => cardTraitLabels[trait])
    .join(', ')

  return [
    'You create playful and imaginative LARP character cards for party guests.',
    'Keep the tone creative, safe for a broad age range, and easy to read aloud.',
    'Use the theme as inspiration, but avoid copying exact canon characters, factions, or plotlines.',
    'Return only valid JSON matching the requested schema.',
    '',
    'Party setup:',
    `- Theme category: ${themeCategoryLabels[party.themeCategory]}`,
    `- Mood: ${partyMoodLabels[party.mood]}`,
    '',
    'Character seed:',
    `- Name: ${input.name}`,
    `- Sex: ${sexOptionLabels[input.sex]}`,
    `- Age: ${input.age}`,
    `- Selected traits: ${selectedTraits}`,
    '',
    'Generation rules:',
    '- generatedNameWithClass should feel flavorful and party-ready.',
    '- backgroundHistory must be exactly 2 short sentences.',
    '- characterTraits must contain exactly 3 short trait phrases.',
    '- specialMovement should be a fun physical mannerism or entrance cue.',
    '- specialPhrase should be a memorable short line the player can say in character.',
    '- Avoid explicit, hateful, or inappropriate content.',
  ].join('\n')
}
