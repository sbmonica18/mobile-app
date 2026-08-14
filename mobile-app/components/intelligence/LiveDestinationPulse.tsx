import { CLOUD } from '@/constants/cloudTheme';
import type { DestinationPulse } from '@/services/intelligence/intelligenceTypes';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = {
  pulse: DestinationPulse;
  matchScore?: number;
};

export function LiveDestinationPulse({ pulse, matchScore }: Props) {
  const score = matchScore ?? pulse.scoreNow;
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
      <Text style={styles.kicker}>LIVE DESTINATION PULSE</Text>
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.verdict}>{pulse.verdict} right now</Text>
      </View>
      <View style={styles.grid}>
        {[
          ['Weather', pulse.weather],
          ['Crowd', pulse.crowd],
          ['Traffic', pulse.traffic],
          ['Parking', pulse.parking],
        ].map(([k, v]) => (
          <View key={k} style={styles.cell}>
            <Text style={styles.cellK}>{k}</Text>
            <Text style={styles.cellV} numberOfLines={1}>
              {v}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.windowLabel}>Best window</Text>
      <Text style={styles.window}>{pulse.bestWindowLabel}</Text>
      <View style={styles.bars}>
        {pulse.factors.map((f) => (
          <View key={f.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{f.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${f.value}%` }]} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.score}>{score}%</Text>
          <Text style={styles.scoreTag}>
            {pulse.scoreDelta >= 0 ? 'RECOMMENDED NOW' : 'CONDITIONS CHANGED'}
          </Text>
        </View>
        <Text style={styles.delta}>{pulse.deltaLabel}</Text>
      </View>
      <Text style={styles.ai}>{pulse.verdictLine}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 20,
    gap: 8,
    ...CLOUD.shadows.card,
  },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: CLOUD.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: CLOUD.accent },
  verdict: { fontSize: 18, fontWeight: '900', color: CLOUD.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  cell: {
    width: '47%',
    backgroundColor: CLOUD.soft,
    borderRadius: 12,
    padding: 10,
  },
  cellK: { fontSize: 11, color: CLOUD.muted, fontWeight: '700' },
  cellV: { fontSize: 13, color: CLOUD.ink, fontWeight: '800', marginTop: 2 },
  windowLabel: { marginTop: 8, fontSize: 12, color: CLOUD.muted, fontWeight: '700' },
  window: { fontSize: 16, fontWeight: '800', color: CLOUD.aiAccent },
  bars: { gap: 6, marginTop: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 70, fontSize: 11, color: CLOUD.body, fontWeight: '600' },
  track: { flex: 1, height: 7, borderRadius: 4, backgroundColor: CLOUD.soft, overflow: 'hidden' },
  fill: { height: 7, backgroundColor: CLOUD.primary, borderRadius: 4 },
  scoreRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  score: { fontSize: 28, fontWeight: '900', color: CLOUD.ink },
  scoreTag: { fontSize: 11, fontWeight: '800', color: CLOUD.primary, letterSpacing: 0.4 },
  delta: { fontSize: 12, fontWeight: '700', color: CLOUD.muted },
  ai: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: CLOUD.body,
    backgroundColor: 'rgba(124,58,237,0.04)',
    padding: 12,
    borderRadius: 12,
  },
});
