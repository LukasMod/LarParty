import React from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'

import '@/shared/i18n'

import { Colors } from '@/constants/theme'
import { useAppLanguage } from '@/shared/i18n/use-app-language'

export default function RootLayout() {
  const { t } = useTranslation()

  useAppLanguage()

  return (
    <React.StrictMode>
      <>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.default.text,
            headerStyle: {
              backgroundColor: Colors.default.background,
            },
            headerTitleStyle: {
              color: Colors.default.text,
            },
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: t('screens.home') }} />
          <Stack.Screen
            name="settings"
            options={{ title: t('screens.settings') }}
          />
          <Stack.Screen
            name="party/new"
            options={{ title: t('screens.newParty') }}
          />
          <Stack.Screen
            name="party/[partyId]"
            options={{ title: t('screens.partyDetails') }}
          />
          <Stack.Screen
            name="party/[partyId]/card/new"
            options={{ title: t('screens.newCharacterCard') }}
          />
          <Stack.Screen
            name="party/[partyId]/card/[cardId]"
            options={{ title: t('screens.characterCard') }}
          />
        </Stack>
      </>
    </React.StrictMode>
  )
}
