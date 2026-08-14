import { CLOUD } from '@/constants/cloudTheme';
import type { WhyBreakdown } from '@/services/intelligence/intelligenceTypes';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useEffect, useState } from 'react';

type Props = {
  visible: boolean;
  why: WhyBreakdown | null;
  onClose: () => void;
};

export function WhyRecommendationSheet({ visible, why, onClose }: Props) {
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowScore(false);
      return;
    }
    const t = setTimeout(() => setShowScore(true), 450);
    return () => clearTimeout(t);
  }, [visible]);

  if (!why) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.kicker}>WHY THIS RECOMMENDATION?</Text>
          <Text style={styles.title}>{why.title}</Text>
          <Text style={styles.summary}>{why.summary}</Text>
          <View style={styles.factors}>
            {why.factors.map((f, i) => (
              <Animated.View key={f.key} entering={FadeInUp.delay(80 + i * 70).duration(320)} style={styles.row}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.abs(f.delta) * 8 + 20)}%`,
                        backgroundColor: f.delta >= 0 ? CLOUD.accent : CLOUD.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.delta, { color: f.delta >= 0 ? CLOUD.success : CLOUD.danger }]}>
                  {f.delta >= 0 ? `+${f.delta}` : f.delta}
                </Text>
              </Animated.View>
            ))}
          </View>
          {showScore ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Overall suitability</Text>
              <Text style={styles.score}>{why.overallScore} / 100</Text>
            </Animated.View>
          ) : (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Calculating…</Text>
            </View>
          )}
          <Pressable onPress={onClose} style={styles.close}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.closeText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CLOUD.card,
    borderTopLeftRadius: CLOUD.radii.sheet,
    borderTopRightRadius: CLOUD.radii.sheet,
    padding: 22,
    gap: 10,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: CLOUD.border,
    marginBottom: 8,
  },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: CLOUD.aiAccent },
  title: { fontSize: 20, fontWeight: '900', color: CLOUD.ink },
  summary: { fontSize: 13, lineHeight: 19, color: CLOUD.body },
  factors: { gap: 10, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 86, fontSize: 12, fontWeight: '700', color: CLOUD.body },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLOUD.soft,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  delta: { width: 36, textAlign: 'right', fontWeight: '800', fontSize: 12 },
  scoreBox: {
    marginTop: 12,
    backgroundColor: 'rgba(124,58,237,0.06)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  scoreLabel: { fontSize: 12, color: CLOUD.muted, fontWeight: '700' },
  score: { fontSize: 28, fontWeight: '900', color: CLOUD.aiAccent, marginTop: 4 },
  close: {
    marginTop: 8,
    backgroundColor: CLOUD.primary,
    borderRadius: CLOUD.radii.button,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  closeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
