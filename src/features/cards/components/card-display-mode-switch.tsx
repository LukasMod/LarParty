import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
import { ChipButton } from '@/shared/components/chip-button'
import { cardDisplayModes } from '@/shared/constants/party-options'

export function CardDisplayModeSwitch() {
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
            label={mode === 'collectible' ? 'Collectible view' : 'Info view'}
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
