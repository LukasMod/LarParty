import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { CardSection } from '@/features/cards/components/card-section'
import { ThemeCategory } from '@/features/parties/types'
import { getPartyTheme } from '@/shared/theme/party-theme'

interface CardTraitsSectionProps {
  characterTraits: readonly string[]
  partyThemeCategory: ThemeCategory
}

export function CardTraitsSection({
  characterTraits,
  partyThemeCategory,
}: CardTraitsSectionProps) {
  const partyTheme = getPartyTheme(partyThemeCategory)

  return (
    <CardSection title="Character traits" themeOverride={partyTheme}>
      <View style={styles.traitList}>
        {characterTraits.map((trait) => (
          <ThemedView
            key={trait}
            themeOverride={partyTheme}
            type="surfaceSelected"
            style={styles.traitItem}
          >
            <ThemedText themeOverride={partyTheme}>{trait}</ThemedText>
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}))
