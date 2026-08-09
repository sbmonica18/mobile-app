import { PremiumSplashScreen } from '@/components/PremiumSplashScreen';
import { useAuthStore } from '@/store/authStore';
import { Href, router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Cinematic brand intro → Home (if signed in) or Login.
 * Waits for auth hydrate so a saved login is never bounced to the login screen.
 */
export default function WelcomeSplashScreen() {
  const navigated = useRef(false);
  const splashDone = useRef(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const goNext = useCallback(() => {
    if (navigated.current || !isHydrated || !splashDone.current) return;
    navigated.current = true;
    if (isAuthenticated) {
      router.replace('/(app)/' as Href);
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isHydrated]);

  useEffect(() => {
    goNext();
  }, [goNext]);

  return (
    <PremiumSplashScreen
      onFinished={() => {
        splashDone.current = true;
        goNext();
      }}
    />
  );
}
