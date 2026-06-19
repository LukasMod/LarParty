import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { usePreferencesStore } from '@/features/preferences/store/preferences-store'
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
          <Pressable
            key={mode}
            onPress={() => setCardDisplayMode(mode)}
            style={[styles.modeChip, isSelected && styles.modeChipSelected]}
          >
            <ThemedText
              style={isSelected ? styles.modeChipTextSelected : undefined}
            >
              {mode === 'collectible' ? 'Collectible view' : 'Info view'}
            </ThemedText>
          </Pressable>
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
  modeChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.two,
    backgroundColor: theme.colors.inputBackground,
  },
  modeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeChipTextSelected: {
    color: theme.colors.primaryText,
    fontWeight: '700',
  },
}))
