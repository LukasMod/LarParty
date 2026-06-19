import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'

interface CardSpecialPhraseSectionProps {
  specialPhrase: string
}

export function CardSpecialPhraseSection({
  specialPhrase,
}: CardSpecialPhraseSectionProps) {
  return (
    <CardSection title="Special phrase">
      <ThemedText>“{specialPhrase}”</ThemedText>
    </CardSection>
  )
}
