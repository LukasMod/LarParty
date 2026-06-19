import { ThemedText } from '@/components/themed-text'
import { CardStatus } from '@/features/cards/types'
import { Button } from '@/shared/components/button'

interface CardDetailsActionsProps {
  status: CardStatus
  errorMessage: string | null
  isRegenerating: boolean
  onAcceptCard: () => void
  onRegenerateCard: () => void
  onDeleteCard: () => void
}

export function CardDetailsActions({
  status,
  errorMessage,
  isRegenerating,
  onAcceptCard,
  onRegenerateCard,
  onDeleteCard,
}: CardDetailsActionsProps) {
  return (
    <>
      {errorMessage ? (
        <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
      ) : null}

      {status === 'draft' ? (
        <Button label="Accept card" onPress={onAcceptCard} />
      ) : null}

      <Button
        disabled={isRegenerating}
        label={isRegenerating ? 'Regenerating...' : 'Regenerate card'}
        variant="secondary"
        onPress={onRegenerateCard}
      />

      <Button label="Delete card" variant="secondary" onPress={onDeleteCard} />
    </>
  )
}
