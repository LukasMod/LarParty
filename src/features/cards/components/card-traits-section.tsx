import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { CardSection } from '@/features/cards/components/card-section'

interface CardTraitsSectionProps {
  characterTraits: readonly string[]
}

export function CardTraitsSection({
  characterTraits,
}: CardTraitsSectionProps) {
  return (
    <CardSection title="Character traits">
      <View style={styles.traitList}>
        {characterTraits.map((trait) => (
          <ThemedView key={trait} style={styles.traitItem}>
            <ThemedText>{trait}</ThemedText>
          </ThemedView>
        ))}
      </View>
    </CardSection>
  )
}

const styles = StyleSheet.create((theme) => ({
  traitList: {
    gap: theme.spacing.two,
  },
  traitItem: {
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.three,
    paddingVertical: theme.spacing.two,
  },
}))
