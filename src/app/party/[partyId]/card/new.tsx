import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useCardStore } from '@/features/cards/store/card-store';
import { CharacterCardInput, InputTrait, SexOption } from '@/features/cards/types';
import { generateCharacterCard } from '@/features/generation/gemini';
import { getPartyById } from '@/features/parties/selectors';
import { usePartyStore } from '@/features/parties/store/party-store';
import { Screen } from '@/shared/components/screen';
import {
  cardTraitLabels,
  cardTraits,
  sexOptionLabels,
  sexOptions,
  themeCategoryLabels,
} from '@/shared/constants/party-options';

const MAX_TRAITS = 3;

export default function NewCharacterCardScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const parties = usePartyStore((state) => state.parties);
  const party = useMemo(() => getPartyById(parties, partyId), [parties, partyId]);
  const createDraftCard = useCardStore((state) => state.createDraftCard);

  const [name, setName] = useState('');
  const [sex, setSex] = useState<SexOption>('other');
  const [age, setAge] = useState('25');
  const [selectedTraits, setSelectedTraits] = useState<InputTrait[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleTrait(trait: InputTrait) {
    setSelectedTraits((currentTraits) => {
      if (currentTraits.includes(trait)) {
        return currentTraits.filter((currentTrait) => currentTrait !== trait);
      }

      if (currentTraits.length >= MAX_TRAITS) {
        return currentTraits;
      }

      return [...currentTraits, trait];
    });
  }

  async function handleGenerateCard() {
    if (!party) {
      setErrorMessage('Party not found.');
      return;
    }

    const trimmedName = name.trim();
    const parsedAge = Number.parseInt(age, 10);

    if (!trimmedName) {
      setErrorMessage('Character name is required.');
      return;
    }

    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      setErrorMessage('Enter a valid age.');
      return;
    }

    if (selectedTraits.length === 0 || selectedTraits.length > MAX_TRAITS) {
      setErrorMessage('Choose between 1 and 3 traits.');
      return;
    }

    const input: CharacterCardInput = {
      name: trimmedName,
      sex,
      age: parsedAge,
      selectedTraits,
    };

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const generated = await generateCharacterCard({
        party,
        input,
      });

      const cardId = createDraftCard({
        partyId: party.id,
        input,
        generated,
      });

      router.replace({
        pathname: '/party/[partyId]/card/[cardId]',
        params: { partyId: party.id, cardId },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate card right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      {!party ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Party not found</ThemedText>
          <ThemedText themeColor="textSecondary">
            This party may have been deleted or is still loading.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText type="subtitle">Create Character Card</ThemedText>
            <ThemedText themeColor="textSecondary">
              {party.title} · {themeCategoryLabels[party.themeCategory]}
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Character name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Mira Nightbloom"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Sex</ThemedText>
              <View style={styles.optionGrid}>
                {sexOptions.map((option) => {
                  const isSelected = option === sex;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSex(option)}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}>
                      <ThemedText style={isSelected ? styles.optionChipTextSelected : undefined}>
                        {sexOptionLabels[option]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Age</ThemedText>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Traits</ThemedText>
              <ThemedText themeColor="textSecondary">Pick up to {MAX_TRAITS} traits.</ThemedText>
              <View style={styles.optionGrid}>
                {cardTraits.map((trait) => {
                  const isSelected = selectedTraits.includes(trait);
                  const isDisabled = !isSelected && selectedTraits.length >= MAX_TRAITS;

                  return (
                    <Pressable
                      key={trait}
                      onPress={() => toggleTrait(trait)}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                        isDisabled && styles.optionChipDisabled,
                      ]}>
                      <ThemedText style={isSelected ? styles.optionChipTextSelected : undefined}>
                        {cardTraitLabels[trait]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {errorMessage ? <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText> : null}
          </ThemedView>

          <Pressable
            disabled={isSubmitting}
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={handleGenerateCard}>
            <ThemedText style={styles.primaryButtonText}>
              {isSubmitting ? 'Generating...' : 'Generate character card'}
            </ThemedText>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
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
  optionChipDisabled: {
    opacity: 0.45,
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
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFF8F1',
    fontWeight: '700',
  },
});
