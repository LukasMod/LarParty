import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { Collapse } from '@/shared/components/collapse'
import { LevelSlider } from '@/shared/components/level-slider'
import { levelLabel } from '@/shared/utils/level'

interface TraitLevelRowProps {
  label: string
  level: number
  selected: boolean
  onLevelChange: (level: number) => void
}

/**
 * One trait's intensity control: its name and the chosen level above a
 * `LevelSlider`, all inside a `Collapse` so selecting the chip grows the row
 * out of the form and deselecting it collapses the row away again. The list
 * hosting a column of these gets taller and shorter as traits come and go.
 *
 * The slider's own readout is off — the header already shows the number, and
 * two copies of it would just compete.
 *
 * Spacing lives as this row's own top padding, inside the collapsing content,
 * so a closed row has zero height and leaves no gap behind. The host list must
 * therefore not add a `gap` of its own, or collapsed rows would still reserve
 * space.
 */
export function TraitLevelRow({
  label,
  level,
  selected,
  onLevelChange,
}: TraitLevelRowProps) {
  return (
    <Collapse when={selected}>
      <View style={styles.row}>
        <View style={styles.header}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {levelLabel(level)}
          </ThemedText>
        </View>

        <LevelSlider
          showReadout={false}
          value={level}
          onChange={onLevelChange}
          accessibilityLabel={label}
        />
      </View>
    </Collapse>
  )
}

const styles = StyleSheet.create((theme) => ({
  // Top padding (not a host `gap`) so it animates away with the rest of the
  // row's height when the trait is deselected.
  row: {
    paddingTop: theme.spacing.three,
    gap: theme.spacing.one,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}))
