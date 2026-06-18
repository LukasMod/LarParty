import { PropsWithChildren } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  scrollable = true,
  contentStyle,
  safeAreaStyle,
}: ScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, safeAreaStyle]} edges={['top', 'left', 'right']}>
        {scrollable ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
        ) : (
          content
        )}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
});
