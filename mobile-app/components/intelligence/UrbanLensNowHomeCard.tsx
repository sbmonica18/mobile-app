import { CLOUD } from '@/constants/cloudTheme';
import type { IntelligenceSnapshot } from '@/services/intelligence/intelligenceTypes';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

type Props = {
  snapshot: IntelligenceSnapshot | null;
  loading?: boolean;
  onOpen: () => void;
};

function timeAgo(iso: string) {
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 10) return 'Updated just now';
  if (sec < 60) return `Updated ${sec} sec ago`;
  return `Updated ${Math.round(sec / 60)} min ago`;
}

export function UrbanLensNowHomeCard({ snapshot, loading, onOpen }: Props) {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(0.4, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const liveStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const primary = snapshot?.events[0];
  const changeCount = snapshot?.events.filter((e) => e.type !== 'SIGNAL_GAP').length ?? 0;

  return (
    <Animated.View entering={FadeInUp.delay(80).duration(450)}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <View style={styles.header}>
          <View style={styles.left}>
            <Ionicons name="sparkles" size={16} color={CLOUD.aiAccent} />
            <Text style={styles.brand}>URBANLENS NOW</Text>
          </View>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.dot, liveStyle]} />
            <Text style={styles.live}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.sub}>Live intelligence</Text>
        <Text style={styles.ago}>
          {loading ? 'Refreshing…' : snapshot ? timeAgo(snapshot.updatedAt) : 'Tap to analyze'}
        </Text>
        <Text style={styles.headline}>
          {snapshot?.headline ?? 'See what is happening around you'}
        </Text>
        {primary ? (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>{primary.title}</Text>
            <Text style={styles.previewBody} numberOfLines={2}>
              {primary.description}
            </Text>
          </View>
        ) : (
          <Text style={styles.previewBody}>
            Weather, mobility estimates, and opportunities — without replacing AI Explore.
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.meta}>
            {changeCount} update{changeCount === 1 ? '' : 's'} · {snapshot?.opportunities.length ?? 0}{' '}
            opportunit{(snapshot?.opportunities.length ?? 0) === 1 ? 'y' : 'ies'}
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>See what&apos;s happening</Text>
            <Ionicons name="arrow-forward" size={14} color={CLOUD.primary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 20,
    gap: 6,
    ...CLOUD.shadows.hero,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontSize: 12, fontWeight: '900', letterSpacing: 1, color: CLOUD.aiAccent },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: CLOUD.accent },
  live: { fontSize: 11, fontWeight: '800', color: CLOUD.accent },
  sub: { fontSize: 13, fontWeight: '700', color: CLOUD.ink, marginTop: 4 },
  ago: { fontSize: 12, color: CLOUD.muted },
  headline: { fontSize: 18, fontWeight: '800', color: CLOUD.ink, marginTop: 8 },
  preview: {
    marginTop: 8,
    backgroundColor: 'rgba(124,58,237,0.04)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  previewTitle: { fontSize: 14, fontWeight: '800', color: CLOUD.ink },
  previewBody: { fontSize: 13, lineHeight: 18, color: CLOUD.body, marginTop: 4 },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: { fontSize: 12, color: CLOUD.muted, fontWeight: '600', flex: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaText: { color: CLOUD.primary, fontWeight: '800', fontSize: 13 },
});
