import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('common')

  return (
    <>
      {errorMessage ? (
        <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
      ) : null}

      {status === 'draft' ? (
        <Button label={t('actions.acceptCard')} onPress={onAcceptCard} />
      ) : null}

      <Button
        disabled={isRegenerating}
        label={isRegenerating ? t('actions.regenerating') : t('actions.regenerateCard')}
        variant="secondary"
        onPress={onRegenerateCard}
      />

      <Button
        label={t('actions.deleteCard')}
        variant="secondary"
        onPress={onDeleteCard}
      />
    </>
  )
}
