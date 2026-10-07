import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/shared/components/button'
import { FormCard } from '@/shared/components/form-card'
import {
  DEBUG_LARGE_CARDS_PER_PARTY,
  DEBUG_LARGE_PARTY_COUNT,
  DEBUG_SMALL_CARDS_PER_PARTY,
  DEBUG_SMALL_PARTY_COUNT,
} from '@/shared/debug/debug-data'
import { useDebugActions } from '@/shared/debug/use-debug-actions'

// Render this only inside `__DEV__`; it has no runtime guard of its own.
export function DebugMenu() {
  const { t } = useTranslation(['common', 'debug'])
  const { handleSeedSmall, handleSeedLarge, handleClear } = useDebugActions()

  return (
    <FormCard>
      <ThemedText type="subtitle">{t('debug:sectionTitle')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('debug:intro')}
      </ThemedText>
      <Button
        label={t('debug:seedSmall', {
          parties: DEBUG_SMALL_PARTY_COUNT,
          cards: DEBUG_SMALL_CARDS_PER_PARTY,
        })}
        variant="secondary"
        onPress={handleSeedSmall}
      />
      <Button
        label={t('debug:seedLarge', {
          parties: DEBUG_LARGE_PARTY_COUNT,
          cards: DEBUG_LARGE_CARDS_PER_PARTY,
        })}
        variant="secondary"
        onPress={handleSeedLarge}
      />
      <Button
        label={t('debug:clearAction')}
        variant="secondary"
        onPress={handleClear}
      />
    </FormCard>
  )
}
