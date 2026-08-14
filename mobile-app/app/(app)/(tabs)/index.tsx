import { ExperienceChips } from '@/components/ExperienceChips';
import { HomeAiLaunchpad } from '@/components/HomeAiLaunchpad';
import { HomeDiscoveryModules } from '@/components/HomeDiscoveryModules';
import { HomeHeader, HomeShell } from '@/components/HomeDashboard';
import {
  ContinueExploringSection,
  TrendingNearbySection,
} from '@/components/HomePremiumSections';
import { LiveIntelligenceBar } from '@/components/LiveIntelligenceBar';
import { SearchDestination } from '@/components/SearchDestination';
import { CLOUD, layoutPad } from '@/constants/cloudTheme';
import {
  fetchWeather,
  refineUserLocationLabel,
  requireLiveUserLocation,
} from '@/services/locationService';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const {
    source,
    recent,
    locationLoading,
    setLiveSource,
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
  const { width } = useWindowDimensions();
  const pad = layoutPad(width);

  const bootstrap = useCallback(async (force = false) => {
    setLocationError(null);
    const live = useDashboardStore.getState();

    if (!force && live.hasLiveFix && live.source) {
      setLocationLoading(false);
      if (live.weather) {
        setWeatherLoading(false);
        void refineUserLocationLabel(live.source).then(setSource);
        return;
      }
      if (live.weatherLoading) return;
      setWeatherLoading(true);
      try {
        const next = await fetchWeather(live.source.latitude, live.source.longitude);
        setWeather(next);
      } catch {
        // keep the strip in a loading/empty state; pull-to-refresh retries
      } finally {
        setWeatherLoading(false);
      }
      void refineUserLocationLabel(live.source).then(setSource);
      return;
    }

    setWeatherLoading(true);
    setLocationLoading(true);
    try {
      const location = await requireLiveUserLocation();
      setLiveSource(location);
      setLocationLoading(false);
      void refineUserLocationLabel(location).then(setSource);
      const next = await fetchWeather(location.latitude, location.longitude);
      setWeather(next);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Location unavailable');
      setLocationLoading(false);
    } finally {
      setWeatherLoading(false);
    }
  }, [
    setLocationError,
    setLocationLoading,
    setLiveSource,
    setSource,
    setWeather,
    setWeatherLoading,
  ]);

  useEffect(() => {
    void bootstrap();
    void loadLists();
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
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: pad,
              maxWidth: width > 600 ? 560 : undefined,
              width: '100%',
              alignSelf: width > 600 ? 'center' : undefined,
            },
          ]}
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          refreshControl={
            <RefreshControl
              refreshing={refreshing || locationLoading}
              onRefresh={async () => {
                setRefreshing(true);
                await Promise.all([bootstrap(true), loadLists()]);
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

          {/* Weather: fixed slot + floating overlay (does not push Home) */}
          <View style={styles.weatherLayer}>
            <LiveIntelligenceBar
              refreshToken={pulseToken}
              onRefreshWeather={() => void bootstrap(true)}
            />
          </View>

          {/* Discovery launchpad — Search + AI Explore + experience chips */}
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

          <HomeDiscoveryModules />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </HomeShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingBottom: 20,
    gap: 16,
    overflow: 'visible',
  },
  weatherLayer: {
    zIndex: 100,
    elevation: 12,
  },
  aiHero: {
    gap: 14,
    zIndex: 1,
    overflow: 'visible',
  },
  searchWrap: {
    zIndex: 1,
    elevation: 2,
    overflow: 'visible',
  },
  bottomSpacer: { height: 8 },
});
