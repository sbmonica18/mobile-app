import { useAuthStore } from '@/store/authStore';
import { Href, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { CLOUD } from '@/constants/cloudTheme';

export default function Index() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CLOUD.bg }}>
        <ActivityIndicator color={CLOUD.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={'/(app)/' as Href} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
