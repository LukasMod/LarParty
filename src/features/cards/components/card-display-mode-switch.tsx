import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import { ChipButton } from '@/shared/components/chip-button'
import { cardDisplayModes } from '@/shared/constants/party-options'
import { getCardDisplayModeLabel } from '@/shared/i18n/labels'

export function CardDisplayModeSwitch() {
  const { t } = useTranslation()
  const cardDisplayMode = usePreferencesStore((state) => state.cardDisplayMode)
  const setCardDisplayMode = usePreferencesStore(
    (state) => state.setCardDisplayMode,
  )

  return (
    <View style={styles.modeSwitch}>
      {cardDisplayModes.map((mode) => {
        const isSelected = mode === cardDisplayMode

        return (
          <ChipButton
            key={mode}
            label={getCardDisplayModeLabel(t, mode)}
            selected={isSelected}
            onPress={() => setCardDisplayMode(mode)}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  modeSwitch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.two,
  },
}))
