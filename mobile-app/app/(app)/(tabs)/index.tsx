import { ExperienceChips } from '@/components/ExperienceChips';
import { HomeAiLaunchpad } from '@/components/HomeAiLaunchpad';
import { HomeHeader, HomeShell } from '@/components/HomeDashboard';
import {
  ContinueExploringSection,
  TrendingNearbySection,
} from '@/components/HomePremiumSections';
import { LiveIntelligenceBar } from '@/components/LiveIntelligenceBar';
import { SearchDestination } from '@/components/SearchDestination';
import { CLOUD } from '@/constants/cloudTheme';
import { fetchWeather, getCurrentUserLocation } from '@/services/locationService';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const {
    source,
    recent,
    locationLoading,
    setSource,
    setWeather,
    setLocationLoading,
    setWeatherLoading,
    setLocationError,
    loadLists,
  } = useDashboardStore();
  const { setFilters, resetFilters } = useAiFlowStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pulseToken, setPulseToken] = useState(0);

  const displayName = isGuest ? 'Guest' : user?.fullName?.split(' ')[0] || 'Traveler';

  const bootstrap = useCallback(async () => {
    setLocationLoading(true);
    setWeatherLoading(true);
    setLocationError(null);
    try {
      const location = await getCurrentUserLocation();
      setSource(location);
      setLocationLoading(false);
      void fetchWeather(location.latitude, location.longitude)
        .then(setWeather)
        .catch(() => undefined)
        .finally(() => setWeatherLoading(false));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Location unavailable');
      setWeatherLoading(false);
      setLocationLoading(false);
    }
  }, [
    setLocationError,
    setLocationLoading,
    setSource,
    setWeather,
    setWeatherLoading,
  ]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void bootstrap();
      void loadLists();
    });
    return () => task.cancel();
  }, [bootstrap, loadLists]);

  const openShowcase = (mood?: string) => {
    resetFilters();
    if (mood) setFilters({ mood });
    router.push('/(app)/(ai-flow)/destination-showcase' as Href);
  };

  return (
    <HomeShell>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || locationLoading}
              onRefresh={async () => {
                setRefreshing(true);
                await Promise.all([bootstrap(), loadLists()]);
                setPulseToken((t) => t + 1);
                setRefreshing(false);
              }}
              tintColor={CLOUD.primary}
            />
          }
        >
          <HomeHeader
            name={displayName}
            locationLabel={source?.label}
            onAvatarPress={() => router.push('/(app)/(tabs)/profile')}
          />

          {/* Live Intelligence Bar — weather + Pulse (one card) */}
          <LiveIntelligenceBar
            refreshToken={pulseToken}
            onRefreshWeather={() => void bootstrap()}
          />

          {/* AI Search Hero — primary CTA */}
          <Animated.View entering={FadeInUp.delay(40).duration(420)} style={styles.aiHero}>
            <View style={styles.searchWrap} collapsable={false}>
              <SearchDestination />
            </View>
            <HomeAiLaunchpad onExploreAi={() => openShowcase()} />
            <ExperienceChips />
          </Animated.View>

          {recent.length > 0 ? (
            <ContinueExploringSection recent={recent} />
          ) : (
            <TrendingNearbySection />
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </HomeShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: CLOUD.pad,
    paddingBottom: 36,
    gap: 16,
  },
  aiHero: {
    gap: 14,
    zIndex: 1,
    overflow: 'visible',
  },
  searchWrap: {
    zIndex: 100,
    elevation: 30,
    overflow: 'visible',
  },
  bottomSpacer: { height: 8 },
});
