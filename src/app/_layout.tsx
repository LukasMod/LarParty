import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: Colors.light.text,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTitleStyle: {
            color: Colors.light.text,
          },
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
        }}>
        <Stack.Screen name="index" options={{ title: 'LarParty' }} />
        <Stack.Screen name="party/new" options={{ title: 'New Party' }} />
        <Stack.Screen name="party/[partyId]" options={{ title: 'Party Details' }} />
        <Stack.Screen name="party/[partyId]/card/new" options={{ title: 'New Character Card' }} />
        <Stack.Screen name="party/[partyId]/card/[cardId]" options={{ title: 'Character Card' }} />
      </Stack>
    </>
  );
}
