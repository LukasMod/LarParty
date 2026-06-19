import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'

interface CardSpecialMovementSectionProps {
  specialMovement: string
}

export function CardSpecialMovementSection({
  specialMovement,
}: CardSpecialMovementSectionProps) {
  return (
    <CardSection title="Special movement">
      <ThemedText>{specialMovement}</ThemedText>
    </CardSection>
  )
}
