import { LiveLocationGate } from '@/components/LiveLocationGate';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const colors = useThemeStore((s) => s.colors);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <LiveLocationGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(ai-flow)" />
        <Stack.Screen name="search-results" options={{ animation: 'fade' }} />
        <Stack.Screen name="destination-dashboard" />
        <Stack.Screen
          name="journey-companion"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="journey-story"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="travel-vault" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="urbanlens-now" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </LiveLocationGate>
  );
}
