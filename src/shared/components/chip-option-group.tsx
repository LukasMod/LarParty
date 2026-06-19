import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ChipButton } from '@/shared/components/chip-button'

interface ChipOptionGroupProps<TOption extends string> {
  options: readonly TOption[]
  selectedOptions: readonly TOption[]
  getLabel: (option: TOption) => string
  onPress: (option: TOption) => void
  isOptionDisabled?: (option: TOption) => boolean
}

export function ChipOptionGroup<TOption extends string>({
  options,
  selectedOptions,
  getLabel,
  onPress,
  isOptionDisabled,
}: ChipOptionGroupProps<TOption>) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option)

        return (
          <ChipButton
            key={option}
            disabled={isOptionDisabled?.(option)}
            label={getLabel(option)}
            selected={isSelected}
            onPress={() => onPress(option)}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.two,
  },
}))
