import { CharacterCard, InputTrait } from '@/features/cards/types'
import { PromptSiblingCard } from '@/features/generation/types'
import { DEFAULT_TRAIT_VALUE } from '@/features/generation/utils/trait-value'

interface PartyContextParams {
  cards: readonly CharacterCard[]
  partyId: string
  excludeGenerationGroupId?: string
  traitValueOf?: (card: CharacterCard, trait: InputTrait) => number
}

// Variants of the same card share a seed, so they are never useful as
// anti-similarity context.
export function getPromptSiblings({
  cards,
  partyId,
  excludeGenerationGroupId,
  traitValueOf,
}: PartyContextParams): PromptSiblingCard[] {
  return cards
    .filter(
      (card) =>
        card.partyId === partyId &&
        card.generationGroupId !== excludeGenerationGroupId,
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((card) => ({
      nameWithClass: card.generated.generatedNameWithClass,
      traits: card.input.selectedTraits.map((trait) => ({
        trait,
        traitValue: traitValueOf?.(card, trait) ?? DEFAULT_TRAIT_VALUE,
      })),
      specialPhrase: card.generated.specialPhrase,
      specialMovement: card.generated.specialMovement,
    }))
}

export function getGenerationAttempt(
  cards: readonly CharacterCard[],
  generationGroupId?: string,
) {
  if (!generationGroupId) {
    return 1
  }

  return (
    cards.filter((card) => card.generationGroupId === generationGroupId)
      .length + 1
  )
}
