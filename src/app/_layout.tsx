import React from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { Colors } from '@/constants/theme'

export default function RootLayout() {
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
          <Stack.Screen name="index" options={{ title: 'LarParty' }} />
          <Stack.Screen name="party/new" options={{ title: 'New Party' }} />
          <Stack.Screen
            name="party/[partyId]"
            options={{ title: 'Party Details' }}
          />
          <Stack.Screen
            name="party/[partyId]/card/new"
            options={{ title: 'New Character Card' }}
          />
          <Stack.Screen
            name="party/[partyId]/card/[cardId]"
            options={{ title: 'Character Card' }}
          />
        </Stack>
      </>
    </React.StrictMode>
  )
}
