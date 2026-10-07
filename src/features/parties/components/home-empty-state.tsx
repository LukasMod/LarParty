import { Link } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/shared/components/button'

export function HomeEmptyState() {
  const { t } = useTranslation(['home', 'common'])

  return (
    <View style={styles.container}>
      <ThemedText style={styles.glyph} themeColor="primary">
        ✦
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        {t('home:emptyTitle')}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.body}>
        {t('home:emptyBody')}
      </ThemedText>
      <Link href="/party/new" asChild>
        <Button label={t('home:createFirstParty')} style={styles.cta} />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.three,
    paddingTop: theme.spacing.five,
    paddingBottom: theme.spacing.four,
  },
  glyph: {
    fontSize: 56,
    lineHeight: 64,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.two,
  },
}))
