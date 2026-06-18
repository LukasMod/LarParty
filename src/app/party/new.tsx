import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePartyStore } from '@/features/parties/store/party-store';
import { PartyMood, ThemeCategory } from '@/features/parties/types';
import {
  partyMoodLabels,
  partyMoods,
  themeCategoryLabels,
  themeCategories,
} from '@/shared/constants/party-options';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

export default function NewPartyScreen() {
  const createParty = usePartyStore((state) => state.createParty);
  const [title, setTitle] = useState('');
  const [themeCategory, setThemeCategory] = useState<ThemeCategory>('fantasy');
  const [mood, setMood] = useState<PartyMood>('fun');
  const [showValidationError, setShowValidationError] = useState(false);

  function handleCreateParty() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setShowValidationError(true);
      return;
    }

    const partyId = createParty({
      title: trimmedTitle,
      themeCategory,
      mood,
    });

    router.replace({
      pathname: '/party/[partyId]',
      params: { partyId },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Create Party</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Party name</ThemedText>
              <TextInput
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  if (showValidationError && value.trim()) {
                    setShowValidationError(false);
                  }
                }}
                placeholder="Friday Tavern Night"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.input}
              />
              {showValidationError ? (
                <ThemedText themeColor="textSecondary">Party name is required.</ThemedText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Theme category</ThemedText>
              <View style={styles.optionGrid}>
                {themeCategories.map((option) => {
                  const isSelected = option === themeCategory;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setThemeCategory(option)}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}>
                      <ThemedText style={isSelected ? styles.optionChipTextSelected : undefined}>
                        {themeCategoryLabels[option]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Mood</ThemedText>
              <View style={styles.optionGrid}>
                {partyMoods.map((option) => {
                  const isSelected = option === mood;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setMood(option)}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}>
                      <ThemedText style={isSelected ? styles.optionChipTextSelected : undefined}>
                        {partyMoodLabels[option]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ThemedView>

          <Pressable style={styles.primaryButton} onPress={handleCreateParty}>
            <ThemedText style={styles.primaryButtonText}>Save party</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  input: {
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: '#D6C7AF',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#D6C7AF',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  optionChipSelected: {
    backgroundColor: '#7A3FF2',
    borderColor: '#7A3FF2',
  },
  optionChipTextSelected: {
    color: '#FFF8F1',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#7A3FF2',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF8F1',
    fontWeight: '700',
  },
});
