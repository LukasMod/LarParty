import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/shared/components/button'
import { FormCard } from '@/shared/components/form-card'
import { useDebugActions } from '@/shared/debug/use-debug-actions'

// Render this only inside `__DEV__`; it has no runtime guard of its own.
export function DebugMenu() {
  const { t } = useTranslation(['common', 'debug'])
  const { handleSeedSmall, handleSeedLarge, handleClear } = useDebugActions()

  return (
    <FormCard>
      <ThemedText type="subtitle">{t('debug:sectionTitle')}</ThemedText>
      <Button
        label={t('debug:seedSmall')}
        variant="secondary"
        onPress={handleSeedSmall}
      />
      <Button
        label={t('debug:seedLarge')}
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
