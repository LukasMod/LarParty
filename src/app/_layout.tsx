import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { Colors } from '@/constants/theme';
import { usePartyStore } from '@/features/parties/store/party-store';

const partyRouteColors = {
  fantasy: Colors.default,
  'sci-fi': Colors.ocean,
  horror: Colors.dusk,
  starwars: Colors.ocean,
  'harry-potter': Colors.dusk,
  witcher: Colors.forest,
} as const;

function getRouteColors(pathname: string, parties: ReturnType<typeof usePartyStore.getState>['parties']) {
  const match = pathname.match(/^\/party\/([^/]+)/);
  const partyId = match?.[1];

  if (!partyId) {
    return Colors.default;
  }

  const party = parties.find((entry) => entry.id === decodeURIComponent(partyId));

  if (!party) {
    return Colors.default;
  }

  return partyRouteColors[party.themeCategory] ?? Colors.default;
}

export default function RootLayout() {
  const pathname = usePathname();
  const parties = usePartyStore((state) => state.parties);

  const colors = useMemo(() => getRouteColors(pathname, parties), [pathname, parties]);
  const statusBarStyle = colors.background === Colors.dusk.background ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          contentStyle: {
            backgroundColor: colors.background,
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
