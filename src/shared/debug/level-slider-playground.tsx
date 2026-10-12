import { useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { FormCard } from '@/shared/components/form-card'
import { LevelSlider } from '@/shared/components/level-slider'
import { levelLabel } from '@/shared/utils/level'

// Dev-only host for `LevelSlider`: keeps a live instance on screen so the snap,
// the velocity handoff and the haptics can be feel-checked without wiring the
// component into a form. Nothing outside `__DEV__` should render it.
export function LevelSliderPlayground() {
  const { t } = useTranslation(['common', 'debug'])
  const [value, setValue] = useState(0)

  return (
    <FormCard>
      <ThemedText type="subtitle">{t('debug:sliderTitle')}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {t('debug:sliderHelper')}
      </ThemedText>

      <LevelSlider
        accessibilityLabel={t('debug:sliderTitle')}
        value={value}
        onChange={setValue}
      />

      <View style={styles.value}>
        <ThemedText type="smallBold">{t('debug:sliderValue')}</ThemedText>
        <ThemedText type="smallBold">{levelLabel(value)}</ThemedText>
      </View>
    </FormCard>
  )
}

const styles = StyleSheet.create((theme) => ({
  value: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}))
