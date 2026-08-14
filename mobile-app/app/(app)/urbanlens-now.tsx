import { IdealPlanSheet } from '@/components/intelligence/IdealPlanSheet';
import { IntelligenceEventCard } from '@/components/intelligence/IntelligenceEventCard';
import { IntelligenceScanOverlay } from '@/components/intelligence/IntelligenceScanOverlay';
import { LiveStatusOrb } from '@/components/intelligence/LiveStatusOrb';
import { WhyRecommendationSheet } from '@/components/intelligence/WhyRecommendationSheet';
import { CLOUD } from '@/constants/cloudTheme';
import type { IntelligenceEvent } from '@/services/intelligence/intelligenceTypes';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UrbanLensNowScreen() {
  const source = useDashboardStore((s) => s.source);
  const weather = useDashboardStore((s) => s.weather);
  const destination = useDashboardStore((s) => s.destination);
  const filters = useAiFlowStore((s) => s.filters);
  const snapshot = useIntelligenceStore((s) => s.snapshot);
  const loading = useIntelligenceStore((s) => s.loading);
  const scanning = useIntelligenceStore((s) => s.scanning);
  const refresh = useIntelligenceStore((s) => s.refresh);
  const acceptRecommendation = useIntelligenceStore((s) => s.acceptRecommendation);
  const hydratePriors = useIntelligenceStore((s) => s.hydratePriors);

  const [whyOpen, setWhyOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const spin = useSharedValue(0);

  const runRefresh = useCallback(
    async (withScan: boolean) => {
      spin.value = withTiming(spin.value + 360, { duration: 500 });
      await refresh({
        source,
        weather,
        destination: destination
          ? {
              id: destination.placeKey,
              name: destination.placeName,
              distanceKm: undefined,
            }
          : null,
        prefs: {
          mood: filters.mood ?? undefined,
          budget: filters.budget ?? undefined,
        },
        withScan,
      });
    },
    [destination, filters.budget, filters.mood, refresh, source, spin, weather],
  );

  useEffect(() => {
    void hydratePriors().then(() => runRefresh(true));
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const onAction = (event: IntelligenceEvent) => {
    acceptRecommendation(event.id);
    switch (event.action) {
      case 'BUILD_PLAN':
      case 'ADJUST_PLAN':
        setPlanOpen(true);
        break;
      case 'GO_NOW':
      case 'EXPLORE_ALTERNATIVE':
        router.push('/(app)/(ai-flow)/destination-showcase' as Href);
        break;
      case 'REVIEW_ROUTE':
        router.push('/(app)/(ai-flow)/recommendations' as Href);
        break;
      case 'RE_EVALUATE':
        if (destination?.placeKey) {
          router.push(`/(app)/(ai-flow)/destination/${destination.placeKey}` as Href);
        } else {
          router.push('/(app)/(ai-flow)/recommendations' as Href);
        }
        break;
      case 'OPEN_NOW':
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={CLOUD.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>UrbanLens Now</Text>
          <Text style={styles.sub}>
            {snapshot?.areaLabel ?? source?.label ?? 'Your area'} ·{' '}
            {loading ? 'Updating…' : 'Updated just now'}
          </Text>
        </View>
        <Pressable onPress={() => void runRefresh(true)} hitSlop={10}>
          <Animated.View style={spinStyle}>
            <Ionicons name="refresh" size={20} color={CLOUD.primary} />
          </Animated.View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && !scanning}
            onRefresh={() => void runRefresh(false)}
            tintColor={CLOUD.primary}
          />
        }
      >
        <IntelligenceScanOverlay visible={scanning} />

        {snapshot ? (
          <LiveStatusOrb signalsAnalyzed={snapshot.signalsAnalyzed} signals={snapshot.signals} />
        ) : loading ? (
          <ActivityIndicator color={CLOUD.primary} style={{ marginVertical: 24 }} />
        ) : (
          <Text style={styles.empty}>Pull to refresh intelligence.</Text>
        )}

        <Text style={styles.section}>Intelligence feed</Text>
        {snapshot?.events.length ? (
          snapshot.events.map((event, i) => (
            <IntelligenceEventCard
              key={event.id}
              event={event}
              index={i}
              onWhy={() => setWhyOpen(true)}
              onAction={onAction}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No urgent events</Text>
            <Text style={styles.emptyBody}>
              Traffic intelligence is estimated. Live road closures are unavailable. Weather and
              location still drive recommendations.
            </Text>
          </View>
        )}

        <Pressable style={styles.planCta} onPress={() => setPlanOpen(true)}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.planCtaText}>Build my ideal plan</Text>
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>

      <WhyRecommendationSheet
        visible={whyOpen}
        why={snapshot?.why ?? null}
        onClose={() => setWhyOpen(false)}
      />
      <IdealPlanSheet
        visible={planOpen}
        plan={snapshot?.idealPlan ?? null}
        onClose={() => setPlanOpen(false)}
        onStartJourney={() => {
          setPlanOpen(false);
          router.push('/(app)/(ai-flow)/recommendations' as Href);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLOUD.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: CLOUD.pad,
    paddingVertical: 10,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '900', color: CLOUD.ink },
  sub: { fontSize: 12, color: CLOUD.muted, marginTop: 2 },
  content: { paddingHorizontal: CLOUD.pad, paddingBottom: 40, gap: 12 },
  section: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: CLOUD.muted,
    letterSpacing: 0.4,
  },
  empty: { textAlign: 'center', color: CLOUD.muted, marginVertical: 20 },
  emptyCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 16,
    gap: 6,
  },
  emptyTitle: { fontWeight: '800', color: CLOUD.ink },
  emptyBody: { color: CLOUD.body, fontSize: 13, lineHeight: 18 },
  planCta: {
    marginTop: 8,
    height: 54,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.aiAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  planCtaText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bottomPad: { height: 24 },
});
