import { CLOUD } from '@/constants/cloudTheme';
import type { IntelligenceSignal } from '@/services/intelligence/intelligenceTypes';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

type Props = {
  signalsAnalyzed: number;
  signals: IntelligenceSignal[];
};

export function LiveStatusOrb({ signalsAnalyzed, signals }: Props) {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(1);
  const orbit = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true);
    orbit.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, [orbit, pulse, reduceMotion]);

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const labels = ['Weather', 'Traffic', 'Crowd', 'Parking', 'AQI', 'Roads'];

  return (
    <View style={styles.wrap}>
      <View style={styles.orbBox}>
        <Animated.View style={[styles.ring, coreStyle]} />
        <View style={styles.core}>
          <Animated.View style={styles.liveDot} />
          <Text style={styles.live}>LIVE</Text>
          <Text style={styles.count}>{signalsAnalyzed}</Text>
          <Text style={styles.countLabel}>signals analyzed</Text>
        </View>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.satellite,
              {
                top: 40 + Math.sin((i / 4) * Math.PI * 2) * 48,
                left: 70 + Math.cos((i / 4) * Math.PI * 2) * 58,
                backgroundColor: i % 2 === 0 ? CLOUD.primary : i === 1 ? CLOUD.aiAccent : CLOUD.accent,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.chips}>{labels.join(' · ')}</Text>
      <View style={styles.signalRow}>
        {signals.slice(0, 6).map((s) => (
          <View key={s.key} style={styles.chip}>
            <Text style={styles.chipMark}>
              {s.status === 'available' ? '✓' : s.status === 'estimated' ? '~' : '—'}
            </Text>
            <Text style={styles.chipText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  orbBox: {
    width: 180,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.25)',
    backgroundColor: 'rgba(37,99,235,0.04)',
  },
  core: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: CLOUD.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...CLOUD.shadows.card,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CLOUD.accent,
    marginBottom: 2,
  },
  live: { fontSize: 10, fontWeight: '900', color: CLOUD.accent, letterSpacing: 1 },
  count: { fontSize: 22, fontWeight: '900', color: CLOUD.ink, marginTop: 2 },
  countLabel: { fontSize: 10, color: CLOUD.muted, fontWeight: '600' },
  satellite: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.7,
  },
  chips: { fontSize: 12, color: CLOUD.muted, fontWeight: '600', textAlign: 'center' },
  signalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CLOUD.soft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipMark: { fontSize: 11, fontWeight: '800', color: CLOUD.primary },
  chipText: { fontSize: 11, color: CLOUD.body, fontWeight: '600' },
});
