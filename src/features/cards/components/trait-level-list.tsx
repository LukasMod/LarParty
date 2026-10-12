import { View } from 'react-native'

import { InputTrait, TraitLevels } from '@/features/cards/types'
import { TraitLevelRow } from '@/features/cards/components/trait-level-row'

interface TraitLevelListProps {
  /** Every trait the chip group offers, in that order. */
  traits: readonly InputTrait[]
  selectedTraits: readonly InputTrait[]
  traitLevels: TraitLevels
  getLabel: (trait: InputTrait) => string
  onLevelChange: (trait: InputTrait, level: number) => void
}

/**
 * One `TraitLevelRow` per offered trait. Rows for unselected traits stay
 * rendered but collapsed, which is what lets a deselected trait animate its way
 * out — a row has to still be mounted while its height runs down to zero. A
 * collapsed row costs an empty `Animated.View` at `height: 0`.
 *
 * This wrapper exists so the host sees exactly one child. A form card spaces its
 * children with a `gap`, and a fragment here would expose every collapsed row as
 * a child of its own — each still costing a full gap and leaving visible holes
 * under the chip group. Each row carries its own padding instead.
 */
export function TraitLevelList({
  traits,
  selectedTraits,
  traitLevels,
  getLabel,
  onLevelChange,
}: TraitLevelListProps) {
  return (
    <View>
      {traits.map((trait) => (
        <TraitLevelRow
          key={trait}
          label={getLabel(trait)}
          level={traitLevels[trait] ?? 0}
          selected={selectedTraits.includes(trait)}
          onLevelChange={(level) => onLevelChange(trait, level)}
        />
      ))}
    </View>
  )
}
