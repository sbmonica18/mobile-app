import { useAuthStore } from '@/store/authStore';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { CLOUD } from '@/constants/cloudTheme';

export default function AppLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CLOUD.bg }}>
        <ActivityIndicator color={CLOUD.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: CLOUD.bg },
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
    </Stack>
  );
}
