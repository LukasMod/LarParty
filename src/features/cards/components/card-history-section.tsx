import { ThemedText } from '@/components/themed-text'
import { CardSection } from '@/features/cards/components/card-section'

interface CardHistorySectionProps {
  backgroundHistory: string
}

export function CardHistorySection({
  backgroundHistory,
}: CardHistorySectionProps) {
  return (
    <CardSection title="Background">
      <ThemedText>{backgroundHistory}</ThemedText>
    </CardSection>
  )
}
