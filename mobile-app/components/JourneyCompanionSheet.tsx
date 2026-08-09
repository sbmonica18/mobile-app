import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

const COLLAPSED_HEIGHT = 160;
const EXPANDED_HEIGHT = SCREEN_H * 0.88;
const COLLAPSED_OFFSET = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

type Props = {
  isNavigating: boolean;
  destinationName: string;
  distanceRemaining: number;
  etaMin: number;
  speed: number;
  progressPct: number;
  /** outbound | returning — changes End / complete copy */
  tourLeg?: 'outbound' | 'returning';
  onEndJourney: () => void;
};

const AI_INSIGHTS = [
  'You are currently ahead of schedule by 4 minutes.',
  'Traffic is light ahead. Maintaining current route.',
  'Parking availability is high at the destination.',
  'Scenic viewpoints available along this corridor.',
];

export function JourneyCompanionSheet({
  isNavigating,
  destinationName,
  distanceRemaining,
  etaMin,
  speed,
  progressPct,
  tourLeg = 'outbound',
  onEndJourney,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(COLLAPSED_OFFSET);
  const startY = useSharedValue(0);
  const [insightIdx, setInsightIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const aiPulse = useSharedValue(1);

  useEffect(() => {
    if (isNavigating) {
      translateY.value = withSpring(COLLAPSED_OFFSET, { damping: 15 });
      setExpanded(false);
      aiPulse.value = withRepeat(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      translateY.value = withTiming(EXPANDED_HEIGHT + 100);
      setExpanded(false);
    }
  }, [isNavigating, translateY, aiPulse]);

  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setInsightIdx((prev) => (prev + 1) % AI_INSIGHTS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  const expandSheet = () => {
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    setExpanded(true);
  };

  const collapseSheet = () => {
    translateY.value = withSpring(COLLAPSED_OFFSET, { damping: 14, stiffness: 120 });
    setExpanded(false);
  };

  // Pan only on the handle/header — does not steal ScrollView gestures
  const pan = Gesture.Pan()
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const nextY = Math.max(0, Math.min(startY.value + event.translationY, COLLAPSED_OFFSET));
      translateY.value = nextY;
    })
    .onEnd((event) => {
      const threshold = COLLAPSED_OFFSET / 2;
      if (event.translationY < -40 || translateY.value < threshold) {
        translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
        runOnJS(setExpanded)(true);
      } else {
        translateY.value = withSpring(COLLAPSED_OFFSET, { damping: 14, stiffness: 120 });
        runOnJS(setExpanded)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bodyStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, COLLAPSED_OFFSET * 0.35],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progressPct)) * 100}%`,
  }));

  const aiPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aiPulse.value }],
  }));

  if (!isNavigating) return null;

  const completeBarPad = 54 + 10 + Math.max(insets.bottom, 16) + 12;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={pan}>
        <Animated.View>
          <Pressable
            style={styles.dragHandleArea}
            onPress={() => (expanded ? collapseSheet() : expandSheet())}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.dragHint}>
              {expanded ? 'Swipe down to minimize' : 'Swipe up for full companion'}
            </Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.etaText}>
                {Math.floor(etaMin / 60) > 0 ? `${Math.floor(etaMin / 60)}h ` : ''}
                {Math.floor(etaMin % 60)}m
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.destName} numberOfLines={1}>
                  {destinationName}
                </Text>
                <Text style={styles.distText}>{distanceRemaining.toFixed(1)} km remaining</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressBarStyle]} />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.body, bodyStyle]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: completeBarPad + 24 }]}
          showsVerticalScrollIndicator
          bounces
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.aiCard, aiPulseStyle]}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={16} color={CLOUD.aiAccent} />
              <Text style={styles.aiTitle}>AI Insights</Text>
            </View>
            <Text style={styles.aiText}>{AI_INSIGHTS[insightIdx]}</Text>
          </Animated.View>

          <Text style={styles.sectionTitle}>Live Environment</Text>
          <View style={styles.envGrid}>
            <View style={styles.envCard}>
              <Ionicons name="partly-sunny" size={24} color={CLOUD.warning} />
              <Text style={styles.envVal}>28°C</Text>
              <Text style={styles.envLabel}>Sunny</Text>
            </View>
            <View style={styles.envCard}>
              <Ionicons name="leaf" size={24} color={CLOUD.success} />
              <Text style={styles.envVal}>42</Text>
              <Text style={styles.envLabel}>AQI (Good)</Text>
            </View>
            <View style={styles.envCard}>
              <Ionicons name="sunny" size={24} color={CLOUD.danger} />
              <Text style={styles.envVal}>High</Text>
              <Text style={styles.envLabel}>UV Index</Text>
            </View>
            <View style={styles.envCard}>
              <Ionicons name="water" size={24} color={CLOUD.primary} />
              <Text style={styles.envVal}>10%</Text>
              <Text style={styles.envLabel}>Rain Chance</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Smart Route Alerts</Text>
          <View style={[styles.alertCard, { borderLeftColor: CLOUD.warning }]}>
            <Ionicons name="warning" size={20} color={CLOUD.warning} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.alertTitle}>Moderate Traffic</Text>
              <Text style={styles.alertSub}>Adds +3 mins in 2km</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Along Your Route</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.poiScroll}
            nestedScrollEnabled
          >
            {[
              { id: '1', name: 'Shell Station', dist: 1.2, icon: 'water', color: CLOUD.warning },
              { id: '2', name: 'Cafe Coffee Day', dist: 3.5, icon: 'cafe', color: '#8B5CF6' },
              { id: '3', name: 'Scenic Viewpoint', dist: 8.0, icon: 'image', color: CLOUD.success },
            ].map((poi) => (
              <View key={poi.id} style={styles.poiCard}>
                <View style={[styles.poiIconBox, { backgroundColor: poi.color + '20' }]}>
                  <Ionicons name={poi.icon as any} size={20} color={poi.color} />
                </View>
                <Text style={styles.poiName} numberOfLines={1}>
                  {poi.name}
                </Text>
                <Text style={styles.poiDist}>{poi.dist} km ahead</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxVal}>
                {speed} <Text style={{ fontSize: 14 }}>km/h</Text>
              </Text>
              <Text style={styles.statBoxLabel}>Current Speed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxVal}>
                4.2 <Text style={{ fontSize: 14 }}>L</Text>
              </Text>
              <Text style={styles.statBoxLabel}>Fuel Est.</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statBoxVal, { color: CLOUD.success }]}>+5m</Text>
              <Text style={styles.statBoxLabel}>Time Saved</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Emergency Hub</Text>
          <View style={styles.emergencyGrid}>
            <Pressable style={styles.emBtn}>
              <Ionicons name="medical" size={24} color={CLOUD.danger} />
              <Text style={styles.emText}>Hospital</Text>
            </Pressable>
            <Pressable style={styles.emBtn}>
              <Ionicons name="shield-checkmark" size={24} color={CLOUD.primary} />
              <Text style={styles.emText}>Police</Text>
            </Pressable>
            <Pressable style={styles.emBtn}>
              <Ionicons name="call" size={24} color={CLOUD.warning} />
              <Text style={styles.emText}>SOS</Text>
            </Pressable>
          </View>

          <View style={styles.quickActions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={onEndJourney}
            >
              <Ionicons name="close" size={20} color={CLOUD.danger} />
              <Text style={[styles.actionText, { color: CLOUD.danger }]}>End</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>

      <View style={[styles.completeBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.completeBtn} onPress={onEndJourney}>
          <Ionicons name="flag" size={18} color="#fff" />
          <Text style={styles.completeBtnText}>
            {tourLeg === 'returning'
              ? 'End · Back at start → Budget'
              : 'End · Reached place → Return home'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EXPANDED_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...CLOUD.shadows.hero,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dragHandleArea: {
    paddingTop: 10,
    paddingBottom: 6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dragHint: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: CLOUD.muted,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: CLOUD.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  etaText: {
    fontSize: 36,
    fontWeight: '800',
    color: CLOUD.success,
    letterSpacing: -1,
  },
  destName: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD.ink,
    maxWidth: SCREEN_W * 0.5,
  },
  distText: {
    fontSize: 14,
    color: CLOUD.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: CLOUD.soft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CLOUD.primary,
    borderRadius: 4,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD.ink,
    marginTop: 24,
    marginBottom: 16,
  },
  aiCard: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CLOUD.aiAccent,
  },
  aiText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581C87',
    lineHeight: 22,
  },
  envGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  envCard: {
    width: (SCREEN_W - 48 - 12) / 2,
    backgroundColor: CLOUD.soft,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  envVal: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.ink,
    marginTop: 8,
  },
  envLabel: {
    fontSize: 12,
    color: CLOUD.muted,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: CLOUD.soft,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  alertSub: {
    fontSize: 14,
    color: CLOUD.muted,
    marginTop: 4,
  },
  poiScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  poiCard: {
    width: 140,
    backgroundColor: CLOUD.soft,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  poiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  poiName: {
    fontSize: 15,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  poiDist: {
    fontSize: 13,
    color: CLOUD.muted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: CLOUD.soft,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statBoxVal: {
    fontSize: 24,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  statBoxLabel: {
    fontSize: 12,
    color: CLOUD.muted,
    fontWeight: '600',
    marginTop: 4,
  },
  emergencyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  emBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: CLOUD.border,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  emText: {
    fontSize: 14,
    fontWeight: '700',
    color: CLOUD.ink,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: CLOUD.border,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  completeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: CLOUD.border,
  },
  completeBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: CLOUD.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
