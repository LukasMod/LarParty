import { CharacterCard } from '@/features/cards/types'

export function getCardById(cards: CharacterCard[], cardId: string) {
  return cards.find((card) => card.id === cardId)
}

export function getCardsForParty(cards: CharacterCard[], partyId: string) {
  return cards
    .filter((card) => card.partyId === partyId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}
