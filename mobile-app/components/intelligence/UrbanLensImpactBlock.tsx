import { CLOUD } from '@/constants/cloudTheme';
import type { IntelligenceImpact } from '@/services/intelligence/intelligenceTypes';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  impact: IntelligenceImpact;
  title?: string;
};

export function UrbanLensImpactBlock({ impact, title = 'URBANLENS IMPACT' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>{title}</Text>
      <View style={styles.stats}>
        <Stat
          label={impact.minutesAreEstimate ? 'Est. time helped' : 'Time saved'}
          value={`${impact.minutesSavedEst} min`}
        />
        <Stat label="Routes adjusted" value={String(impact.routesAdjusted)} />
        <Stat label="Condition changes" value={String(impact.conditionChanges)} />
        <Stat label="Recs accepted" value={String(impact.recommendationsAccepted)} />
      </View>
      {impact.bullets.map((b) => (
        <Text key={b} style={styles.bullet}>
          ✓ {b}
        </Text>
      ))}
      <Text style={styles.reflection}>{impact.reflection}</Text>
      {impact.minutesAreEstimate ? (
        <Text style={styles.note}>Time figures are estimates from signal heuristics, not GPS proof.</Text>
      ) : null}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: CLOUD.aiAccent },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  stat: {
    width: '47%',
    backgroundColor: 'rgba(124,58,237,0.05)',
    borderRadius: 12,
    padding: 10,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: CLOUD.ink },
  statLabel: { fontSize: 11, color: CLOUD.muted, fontWeight: '600', marginTop: 2 },
  bullet: { fontSize: 13, color: CLOUD.body, fontWeight: '600' },
  reflection: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: CLOUD.body,
    fontStyle: 'italic',
  },
  note: { fontSize: 11, color: CLOUD.muted, marginTop: 4 },
});
