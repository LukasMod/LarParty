import { GenerateCharacterCardRequest } from '@/features/generation/types'
import {
  getGenerationLanguageName,
  getGenerationPromptLabels,
  getGenerationTranslator,
} from '@/shared/i18n/generation'

export function buildCharacterCardPrompt({
  party,
  input,
  outputLanguage,
}: GenerateCharacterCardRequest) {
  const t = getGenerationTranslator(outputLanguage)
  const labels = getGenerationPromptLabels(t, party, input)

  return [
    'You create playful and imaginative LARP character cards for party guests.',
    'Keep the tone creative, safe for a broad age range, and easy to read aloud.',
    'Use the theme as inspiration, but avoid copying exact canon characters, factions, or plotlines.',
    `Write all generated field values in ${getGenerationLanguageName(outputLanguage)}.`,
    'Keep the JSON schema keys exactly as requested and localize only the string values.',
    'Return only valid JSON matching the requested schema.',
    '',
    'Party setup:',
    `- Theme category: ${labels.themeCategory}`,
    `- Mood: ${labels.mood}`,
    '',
    'Character seed:',
    `- Name: ${input.name}`,
    `- Sex: ${labels.sex}`,
    `- Age: ${input.age}`,
    `- Selected traits: ${labels.selectedTraits.join(', ')}`,
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
