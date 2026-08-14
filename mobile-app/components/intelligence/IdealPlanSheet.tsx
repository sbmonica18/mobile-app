import { CLOUD } from '@/constants/cloudTheme';
import type { IdealPlan } from '@/services/intelligence/intelligenceTypes';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  plan: IdealPlan | null;
  onClose: () => void;
  onStartJourney: () => void;
};

export function IdealPlanSheet({ visible, plan, onClose, onStartJourney }: Props) {
  if (!plan) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.kicker}>BUILD MY IDEAL PLAN</Text>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.sub}>{plan.subtitle}</Text>
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {plan.stops.map((stop, i) => (
              <View key={stop.id} style={styles.stop}>
                <View style={styles.rail}>
                  <View style={styles.dot} />
                  {i < plan.stops.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.stopBody}>
                  <Text style={styles.time}>{stop.timeLabel}</Text>
                  <Text style={styles.stopTitle}>{stop.title}</Text>
                  <Text style={styles.note}>{stop.note}</Text>
                  {stop.travelMinutesAfter != null ? (
                    <Text style={styles.travel}>↓ {stop.travelMinutesAfter} min</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.why}>{plan.whySummary}</Text>
          <Pressable style={styles.primary} onPress={onStartJourney}>
            <Text style={styles.primaryText}>Start Journey</Text>
            <Ionicons name="navigate" size={16} color="#fff" />
          </Pressable>
          <Pressable style={styles.secondary} onPress={onClose}>
            <Text style={styles.secondaryText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: CLOUD.card,
    borderTopLeftRadius: CLOUD.radii.sheet,
    borderTopRightRadius: CLOUD.radii.sheet,
    padding: 22,
    paddingBottom: 28,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: CLOUD.border,
    marginBottom: 6,
  },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: CLOUD.primary },
  title: { fontSize: 22, fontWeight: '900', color: CLOUD.ink },
  sub: { fontSize: 13, color: CLOUD.body, marginBottom: 8 },
  stop: { flexDirection: 'row', gap: 12, minHeight: 72 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: CLOUD.primary, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: CLOUD.border, marginTop: 4 },
  stopBody: { flex: 1, paddingBottom: 12 },
  time: { fontSize: 12, fontWeight: '800', color: CLOUD.aiAccent },
  stopTitle: { fontSize: 16, fontWeight: '800', color: CLOUD.ink },
  note: { fontSize: 13, color: CLOUD.body, marginTop: 2 },
  travel: { fontSize: 12, color: CLOUD.muted, marginTop: 6, fontWeight: '600' },
  why: { fontSize: 13, color: CLOUD.muted, fontStyle: 'italic', marginTop: 4 },
  primary: {
    marginTop: 8,
    height: 54,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondary: { alignItems: 'center', paddingVertical: 12 },
  secondaryText: { color: CLOUD.muted, fontWeight: '700' },
});
