import {
  GenerateCharacterCardRequest,
  PromptSiblingCard,
} from '@/features/generation/types'
import {
  resolveSeedTraits,
  seedTraitValuesOf,
  shouldPrintTraitValues,
  traitListOf,
  traitSeedLinesOf,
} from '@/features/generation/utils/seed-traits'
import {
  clampTraitValue,
  DEFAULT_TRAIT_VALUE,
  formatTraitValue,
  getLoudestTraitIndex,
  traitValueScaleLines,
} from '@/features/generation/utils/trait-value'
import {
  getGenerationLanguageName,
  getGenerationPromptLabels,
  getGenerationTranslator,
} from '@/shared/i18n/generation'
import { TFunction } from 'i18next'
import { getCardTraitLabel } from '@/shared/i18n/labels'

export const MAX_PARTY_SIBLING_SUMMARIES = 15

export function buildCharacterCardPrompt({
  party,
  input,
  outputLanguage,
  attempt,
  seedTraits,
  siblings,
}: GenerateCharacterCardRequest) {
  const t = getGenerationTranslator(outputLanguage)
  const labels = getGenerationPromptLabels(t, party, input)
  const seeds = resolveSeedTraits(input, seedTraits)
  const seedLabels: string[] = seeds.map((seed, index) =>
    String(labels.selectedTraits[index] ?? seed.trait),
  )
  const printValues = shouldPrintTraitValues(seeds)
  const loudestIndex = getLoudestTraitIndex(seedTraitValuesOf(seeds))
  const loudestLabel = loudestIndex >= 0 ? seedLabels[loudestIndex] : null

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
    printValues
      ? '- Selected traits, each with an intensity value:'
      : `- Selected traits: ${traitListOf(seeds, seedLabels)}`,
    ...(printValues ? traitSeedLinesOf(seeds, seedLabels) : []),
    ...(printValues ? ['', ...traitValueScaleLines] : []),
    '',
    'Uniqueness:',
    '- The trait set suggests one obvious archetype. Do not write that archetype. Write the',
    '  character that archetype would avoid meeting at the party.',
    '- Include exactly one concrete, specific, slightly odd detail: a trade, a habit, a',
    '  possession, a grudge, a debt, or a place. It must be too specific to fit any other guest.',
    '- Never use these setups: the chosen one, the fallen noble, the orphan with a birthmark,',
    '  the retired assassin or spy, the amnesiac, the one with a dark past, the last of their',
    '  kind, a prophecy, a cursed object, or a strange star.',
    '- Do not open backgroundHistory with a birth, a prophecy, a list of titles, or what every',
    '  other guest already knows.',
    '- Reveal each trait through behaviour, taste, or a habit. Never restate the trait word.',
    '- Vary sentence shape and length. Do not open two fields the same way.',
    '',
    ...(attempt && attempt > 1 ? divergenceLines(attempt) : []),
    ...(siblings && siblings.length > 0 ? siblingLines(t, siblings) : []),
    'Generation rules:',
    `- generatedNameWithClass is a given name plus one concrete role, title, or epithet tied to ${
      loudestLabel ? `the loudest trait (${loudestLabel})` : 'the character'
    }. Avoid the "the [adjective] [noun]" pattern.`,
    '- backgroundHistory must be exactly 3 short sentences.',
    `- characterTraits must contain exactly 3 short trait phrases${
      printValues && seeds.length > 0
        ? ', one per selected trait in the seed order, each carrying its own intensity value.'
        : '.'
    }`,
    `- specialMovement should be a fun physical mannerism or entrance cue${
      loudestLabel
        ? ` that grows out of the loudest trait (${loudestLabel})`
        : ' for the player to use'
    }.`,
    '- specialPhrase should be a memorable short line the player can say in character, and a different kind of joke from the trait phrases.',
    '- Avoid explicit, hateful, or inappropriate content.',
  ].join('\n')
}

function divergenceLines(attempt: number) {
  return [
    'Divergence:',
    `- This is variant ${attempt} for this exact seed. Keep every trait and intensity value`,
    '  exactly as given and change everything else: the trade, the place, the epithet, the',
    '  mannerism, the phrase.',
    '- Do not reuse the wording of your own most obvious first answer.',
    '',
  ]
}

function siblingLines(t: TFunction, siblings: readonly PromptSiblingCard[]) {
  return [
    'Other characters already at this party. Do not repeat them:',
    ...siblings.slice(0, MAX_PARTY_SIBLING_SUMMARIES).map((sibling) => {
      const traits = sibling.traits
        .map(({ trait, traitValue }) => {
          const label = getCardTraitLabel(t, trait)
          const value = clampTraitValue(traitValue)

          return value === DEFAULT_TRAIT_VALUE
            ? label
            : `${label} ${formatTraitValue(value)}`
        })
        .join(', ')

      return [
        `- ${sibling.nameWithClass} | traits: ${traits}`,
        `| phrase: "${sibling.specialPhrase}"`,
        `| movement: "${sibling.specialMovement}"`,
      ].join(' ')
    }),
    '- Reuse no name token, epithet pattern, phrase, mannerism, prop, trade, or place from the',
    '  list above.',
    '- Do not copy a name shape already used there, such as alliteration or "[Name] of [Place]".',
    '- When a trait repeats across cards, reveal it in a different domain: a different trade,',
    '  obsession, or physicality.',
    '- Two cards with identical traits and values must still read as two different guests.',
    '- Never name-drop, reference, or team up with a character from the list.',
    '',
  ]
}
