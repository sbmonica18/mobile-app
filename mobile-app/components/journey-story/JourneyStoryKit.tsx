import { CLOUD } from '@/constants/cloudTheme';
import type {
  JourneyAchievement,
  JourneyEnvironmentPoint,
  JourneyHighlight,
  JourneyMemory,
  JourneyScoreFactor,
  JourneyStatistics,
  JourneyStoryPayload,
  JourneyTimelineStop,
} from '@/types/journeyStory';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

export function GlassCard({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode;
  style?: any;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(480).springify().damping(16)}
      style={[styles.glass, style]}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 900,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const steps = 28;
    const step = value / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start * 10) / 10);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [value, duration, reduce]);

  const shown = Number.isInteger(value) ? Math.round(display) : display.toFixed(1);
  return (
    <Text style={styles.counter}>
      {prefix}
      {shown}
      {suffix}
    </Text>
  );
}

export function JourneyHero({ story }: { story: JourneyStoryPayload }) {
  const reduce = useReducedMotion();
  const zoom = useSharedValue(1);
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    if (!reduce) {
      zoom.value = withRepeat(
        withTiming(1.08, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [fade, zoom, reduce]);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <View style={styles.hero}>
      <Animated.View style={[StyleSheet.absoluteFill, imgStyle]}>
        <ImageBackground source={{ uri: story.destinationImage }} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(15,23,42,0.15)', 'rgba(15,23,42,0.72)', 'rgba(15,23,42,0.92)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </Animated.View>
      <Animated.View style={[styles.heroBody, textStyle]}>
        <Text style={styles.heroEyebrow}>Journey Completed</Text>
        <Text style={styles.heroTitle}>{story.destinationName}</Text>
        <Text style={styles.heroMeta}>{story.completedAt}</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroPill}>
            <Ionicons name="navigate-outline" size={14} color="#fff" />
            <Text style={styles.heroPillText}>{story.statistics.distanceKm} km</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.heroPillText}>
              {Math.floor(story.statistics.travelMinutes / 60)}h{' '}
              {story.statistics.travelMinutes % 60}m
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="partly-sunny-outline" size={14} color="#fff" />
            <Text style={styles.heroPillText}>{story.weatherLabel}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export function JourneyStoryCard({ narrative }: { narrative: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? narrative : '');
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      setShown(narrative);
      return;
    }
    pulse.value = withRepeat(withTiming(1.15, { duration: 700 }), -1, true);
    let i = 0;
    const timer = setInterval(() => {
      i += 2;
      setShown(narrative.slice(0, i));
      if (i >= narrative.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [narrative, reduce, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <GlassCard delay={80} style={styles.sectionCard}>
      <View style={styles.storyHeader}>
        <Animated.View style={pulseStyle}>
          <Ionicons name="sparkles" size={18} color={CLOUD.aiAccent} />
        </Animated.View>
        <Text style={styles.sectionKicker}>AI Journey Story</Text>
      </View>
      <Text style={styles.narrative}>
        {shown}
        {!reduce && shown.length < narrative.length ? '|' : ''}
      </Text>
    </GlassCard>
  );
}

export function RouteReplay({
  coordinates,
  destinationName,
}: {
  coordinates: { latitude: number; longitude: number }[];
  destinationName: string;
}) {
  const progress = useSharedValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: reduce ? 0 : 2200,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [progress, reduce, coordinates]);

  const lineStyle = useAnimatedStyle(() => ({
    width: `${Math.max(8, progress.value * 100)}%`,
  }));

  return (
    <GlassCard delay={140} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Route replay</Text>
      <Text style={styles.sectionSub}>
        From the road to {destinationName} — watch the path draw itself.
      </Text>
      <View style={styles.replayTrack}>
        <View style={styles.replayRail} />
        <Animated.View style={[styles.replayFill, lineStyle]} />
        <View style={styles.replayDotStart} />
        <View style={styles.replayDotEnd}>
          <Ionicons name="flag" size={12} color="#fff" />
        </View>
      </View>
      <View style={styles.replayMeta}>
        <Text style={styles.muted}>{coordinates.length} path points · cinematic draw</Text>
      </View>
    </GlassCard>
  );
}

export function JourneyTimeline({ stops }: { stops: JourneyTimelineStop[] }) {
  return (
    <GlassCard delay={180} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Timeline</Text>
      {stops.map((stop, index) => (
        <Animated.View
          key={stop.id}
          entering={FadeInDown.delay(200 + index * 70).duration(400)}
          style={[styles.timelineRow, index % 2 === 1 && styles.timelineAlt]}
        >
          <Image source={{ uri: stop.imageUrl }} style={styles.timelineImg} />
          <View style={styles.timelineBody}>
            <Text style={styles.timelineTitle}>{stop.title}</Text>
            <Text style={styles.muted}>
              {stop.time} · {stop.duration}
            </Text>
            <Text style={styles.timelineNote}>{stop.note}</Text>
            <Text style={styles.mood}>{stop.mood}</Text>
          </View>
        </Animated.View>
      ))}
    </GlassCard>
  );
}

export function JourneyStatisticsGrid({ stats }: { stats: JourneyStatistics }) {
  const items = [
    { label: 'Distance', value: stats.distanceKm, suffix: ' km' },
    { label: 'Travel time', value: stats.travelMinutes, suffix: ' min' },
    { label: 'Avg speed', value: stats.avgSpeedKmh, suffix: ' km/h' },
    { label: 'Max speed', value: stats.maxSpeedKmh, suffix: ' km/h' },
    { label: 'Fuel', value: stats.fuelLiters, suffix: ' L' },
    { label: 'Fuel cost', value: stats.fuelCostInr, prefix: '₹' },
    { label: 'Food', value: stats.foodCostInr ?? 0, prefix: '₹' },
    {
      label: 'Other costs',
      value: stats.otherCostInr ?? stats.parkingCostInr + stats.tollsInr,
      prefix: '₹',
    },
    ...(stats.estimatedBudgetInr != null &&
    stats.estimatedBudgetInr !== stats.totalBudgetInr
      ? [{ label: 'Default estimate', value: stats.estimatedBudgetInr, prefix: '₹' as const }]
      : []),
    { label: 'Your budget', value: stats.totalBudgetInr, prefix: '₹' },
    { label: 'Carbon', value: stats.carbonKg, suffix: ' kg' },
    { label: 'Calories', value: stats.caloriesWalked, suffix: '' },
    { label: 'Stops', value: stats.stopsMade, suffix: '' },
  ];

  return (
    <GlassCard delay={220} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Journey analytics</Text>
      <View style={styles.statGrid}>
        {items.map((item) => (
          <View key={item.label} style={styles.statCell}>
            <Text style={styles.statLabel}>{item.label}</Text>
            <AnimatedCounter value={item.value} prefix={item.prefix} suffix={item.suffix} />
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function JourneyHighlights({ items }: { items: JourneyHighlight[] }) {
  return (
    <GlassCard delay={260} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Highlights</Text>
      <View style={styles.highlightGrid}>
        {items.map((h) => (
          <Pressable key={h.id} style={styles.highlightCard}>
            <ImageBackground source={{ uri: h.imageUrl }} style={styles.highlightImg}>
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.highlightOverlay}>
                <View style={[styles.badge, { backgroundColor: h.gradient[0] }]}>
                  <Text style={styles.badgeText}>{h.badge}</Text>
                </View>
                <Text style={styles.highlightTitle}>{h.title}</Text>
                <Text style={styles.highlightDesc}>{h.description}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        ))}
      </View>
    </GlassCard>
  );
}

export function MemoryGallery({
  memories,
  onToggleFavorite,
}: {
  memories: JourneyMemory[];
  onToggleFavorite: (id: string) => void;
}) {
  if (!memories.length) {
    return (
      <GlassCard delay={300} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Memories</Text>
        <Text style={styles.emptyCopy}>No photos yet — add a memory to keep this day alive.</Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard delay={300} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Memory gallery</Text>
      <View style={styles.masonry}>
        {memories.map((m, i) => (
          <Pressable
            key={m.id}
            style={[styles.memoryCard, i % 3 === 0 && styles.memoryTall]}
            onPress={() => onToggleFavorite(m.id)}
          >
            <Image source={{ uri: m.imageUrl }} style={styles.memoryImg} />
            <View style={styles.memoryFooter}>
              <Text style={styles.memoryCaption} numberOfLines={1}>
                {m.caption}
              </Text>
              <Ionicons
                name={m.favorited ? 'heart' : 'heart-outline'}
                size={16}
                color={m.favorited ? CLOUD.danger : CLOUD.muted}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </GlassCard>
  );
}

export function EnvironmentalSummary({ points }: { points: JourneyEnvironmentPoint[] }) {
  return (
    <GlassCard delay={340} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Environmental summary</Text>
      {points.map((p) => (
        <View key={p.label} style={styles.envRow}>
          <Text style={styles.envLabel}>{p.label}</Text>
          <View style={styles.envTrack}>
            <View
              style={[
                styles.envFill,
                { width: `${Math.min(100, typeof p.value === 'number' ? (p.label === 'AQI' ? Math.min(100, p.value) : p.value) : 50)}%` },
              ]}
            />
          </View>
          <Text style={styles.envValue}>
            {p.value}
            {p.unit || ''}
          </Text>
        </View>
      ))}
    </GlassCard>
  );
}

export function TravelScoreRing({
  score,
  factors,
}: {
  score: number;
  factors: JourneyScoreFactor[];
}) {
  const reduce = useReducedMotion();
  const ring = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    ring.value = withDelay(
      200,
      withSpring(1, { damping: 14, stiffness: 90 }),
    );
  }, [ring]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + ring.value * 0.15 }],
    opacity: 0.4 + ring.value * 0.6,
  }));

  return (
    <GlassCard delay={380} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>AI Travel Score</Text>
      <Animated.View style={[styles.scoreRing, ringStyle]}>
        <Text style={styles.scoreBig}>{score}</Text>
        <Text style={styles.scoreOut}>/ 100</Text>
      </Animated.View>
      {factors.map((f) => (
        <View key={f.key} style={styles.factorRow}>
          <View style={styles.factorTop}>
            <Text style={styles.factorLabel}>{f.label}</Text>
            <Text style={styles.factorScore}>{f.score}</Text>
          </View>
          <Text style={styles.factorReason}>{f.reason}</Text>
        </View>
      ))}
    </GlassCard>
  );
}

export function AchievementsRow({ items }: { items: JourneyAchievement[] }) {
  return (
    <GlassCard delay={420} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achGrid}>
        {items.map((a) => (
          <View key={a.id} style={[styles.achCard, !a.unlocked && styles.achLocked]}>
            <Ionicons
              name={(a.icon as any) || 'trophy-outline'}
              size={22}
              color={a.unlocked ? CLOUD.primary : CLOUD.muted}
            />
            <Text style={styles.achTitle}>{a.title}</Text>
            <Text style={styles.achSub}>{a.subtitle}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function StoryShareCard({ story }: { story: JourneyStoryPayload }) {
  const onShare = async () => {
    try {
      await Share.share({
        message: `UrbanLens Journey Story — ${story.destinationName}\nScore ${story.travelScore}/100\n${story.statistics.distanceKm} km · ${story.narrative.slice(0, 160)}…`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <GlassCard delay={460} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Share your story</Text>
      <LinearGradient colors={['#1E3A8A', '#2563EB', '#14B8A6']} style={styles.sharePreview}>
        <Text style={styles.shareBrand}>UrbanLens</Text>
        <Text style={styles.shareDest}>{story.destinationName}</Text>
        <Text style={styles.shareScore}>{story.travelScore} travel score</Text>
        <Text style={styles.shareStats}>
          {story.statistics.distanceKm} km · ₹{story.statistics.totalBudgetInr}
        </Text>
      </LinearGradient>
      <Pressable style={styles.primaryBtn} onPress={onShare}>
        <Ionicons name="share-outline" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Share story card</Text>
      </Pressable>
    </GlassCard>
  );
}

export function SaveToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.toast}>
      <Ionicons name="checkmark-circle" size={20} color={CLOUD.success} />
      <Text style={styles.toastText}>Saved to Travel Vault</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    padding: 20,
    ...CLOUD.shadows.card,
  },
  sectionCard: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.ink,
    marginBottom: 8,
  },
  sectionSub: { color: CLOUD.muted, marginBottom: 14, lineHeight: 20 },
  sectionKicker: {
    color: CLOUD.aiAccent,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  counter: { color: CLOUD.ink, fontSize: 18, fontWeight: '800' },
  muted: { color: CLOUD.muted, fontSize: 12, fontWeight: '600' },
  hero: {
    height: Math.min(420, SCREEN_W * 1.15),
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 18,
  },
  heroBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 32,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 8,
  },
  heroTitle: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  heroMeta: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 15 },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  narrative: { color: CLOUD.body, fontSize: 16, lineHeight: 26 },
  replayTrack: {
    height: 16,
    borderRadius: 999,
    backgroundColor: CLOUD.soft,
    marginTop: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  replayRail: { ...StyleSheet.absoluteFillObject, backgroundColor: CLOUD.soft },
  replayFill: {
    height: '100%',
    backgroundColor: CLOUD.primary,
    borderRadius: 999,
  },
  replayDotStart: {
    position: 'absolute',
    left: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  replayDotEnd: {
    position: 'absolute',
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CLOUD.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayMeta: { marginTop: 12 },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    padding: 10,
    borderRadius: 18,
    backgroundColor: CLOUD.soft,
  },
  timelineAlt: { backgroundColor: '#EEF2FF' },
  timelineImg: { width: 64, height: 64, borderRadius: 14 },
  timelineBody: { flex: 1 },
  timelineTitle: { color: CLOUD.ink, fontWeight: '800', fontSize: 15 },
  timelineNote: { color: CLOUD.body, marginTop: 4, fontSize: 13 },
  mood: { marginTop: 4, color: CLOUD.primary, fontWeight: '700', fontSize: 12 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCell: {
    width: (SCREEN_W - 40 - 40 - 10) / 2,
    backgroundColor: CLOUD.soft,
    borderRadius: 16,
    padding: 12,
  },
  statLabel: { color: CLOUD.muted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  highlightGrid: { gap: 12 },
  highlightCard: {
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
  },
  highlightImg: { flex: 1 },
  highlightOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  highlightTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  highlightDesc: { color: 'rgba(255,255,255,0.85)', marginTop: 2, fontSize: 13 },
  masonry: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  memoryCard: {
    width: (SCREEN_W - 40 - 40 - 10) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: CLOUD.soft,
  },
  memoryTall: { minHeight: 180 },
  memoryImg: { width: '100%', height: 120 },
  memoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  memoryCaption: { flex: 1, color: CLOUD.ink, fontSize: 12, fontWeight: '600' },
  emptyCopy: { color: CLOUD.muted, lineHeight: 20 },
  envRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  envLabel: { width: 70, color: CLOUD.muted, fontSize: 12, fontWeight: '700' },
  envTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: CLOUD.soft,
    overflow: 'hidden',
  },
  envFill: { height: '100%', backgroundColor: CLOUD.accent, borderRadius: 999 },
  envValue: { width: 52, textAlign: 'right', color: CLOUD.ink, fontWeight: '700', fontSize: 12 },
  scoreRing: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    backgroundColor: CLOUD.lightBlue,
  },
  scoreBig: { fontSize: 42, fontWeight: '900', color: CLOUD.ink },
  scoreOut: { color: CLOUD.muted, fontWeight: '700' },
  factorRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: CLOUD.border },
  factorTop: { flexDirection: 'row', justifyContent: 'space-between' },
  factorLabel: { color: CLOUD.ink, fontWeight: '700' },
  factorScore: { color: CLOUD.primary, fontWeight: '800' },
  factorReason: { color: CLOUD.muted, marginTop: 4, fontSize: 13, lineHeight: 18 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achCard: {
    width: (SCREEN_W - 40 - 40 - 10) / 2,
    backgroundColor: CLOUD.soft,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  achLocked: { opacity: 0.45 },
  achTitle: { color: CLOUD.ink, fontWeight: '800' },
  achSub: { color: CLOUD.muted, fontSize: 11, lineHeight: 15 },
  sharePreview: {
    borderRadius: 22,
    padding: 22,
    minHeight: 160,
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  shareBrand: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 1 },
  shareDest: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 6 },
  shareScore: { color: '#fff', fontWeight: '700', marginTop: 8 },
  shareStats: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.search,
    zIndex: 20,
  },
  toastText: { color: CLOUD.ink, fontWeight: '700' },
});
