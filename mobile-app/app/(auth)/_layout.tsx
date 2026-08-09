import { useAuthStore } from '@/store/authStore';
import { Href, Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050E28' }}>
        <ActivityIndicator color="#93C5FD" />
      </View>
    );
  }

  // Guests may open Login / Signup to convert their session into a real account.
  if (isAuthenticated && !isGuest) {
    return <Redirect href={'/(app)/' as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050E28' },
        animation: 'slide_from_right',
      }}
    />
  );
}
