import 'react-native-gesture-handler';
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CLOUD } from '@/constants/cloudTheme';
import { useAuthStore } from '@/store/authStore';

// Never hold the native splash while fonts download over tunnel.
void SplashScreen.preventAutoHideAsync()
  .then(() => SplashScreen.hideAsync())
  .catch(() => undefined);

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
            staleTime: 60_000,
          },
        },
      }),
  );

  // Local bundled fonts — Google font packages time out on slow web (fontfaceobserver 6s).
  useFonts({
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
    ManropeBold: require('../assets/fonts/Manrope-Bold.ttf'),
  });

  useEffect(() => {
    void hydrate().catch(() => undefined);
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: CLOUD.bg },
            animation: 'fade',
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
});
