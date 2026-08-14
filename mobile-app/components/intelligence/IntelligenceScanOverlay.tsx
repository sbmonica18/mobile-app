import { CLOUD } from '@/constants/cloudTheme';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useEffect, useState } from 'react';

const STEPS = ['Location', 'Weather', 'Mobility', 'Crowd', 'Destination'] as const;

type Props = {
  visible: boolean;
};

export function IntelligenceScanOverlay({ visible }: Props) {
  const [done, setDone] = useState<number>(0);

  useEffect(() => {
    if (!visible) {
      setDone(0);
      return;
    }
    setDone(0);
    const timers = STEPS.map((_, i) => setTimeout(() => setDone(i + 1), 140 + i * 150));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.wrap}>
      <Text style={styles.title}>Intelligence scan</Text>
      {STEPS.map((step, i) => (
        <View key={step} style={styles.row}>
          <Text style={styles.step}>{step}</Text>
          <Text style={styles.mark}>{done > i ? '✓' : '…'}</Text>
        </View>
      ))}
      {done >= STEPS.length ? <Text style={styles.ready}>Intelligence ready</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  title: { fontSize: 14, fontWeight: '800', color: CLOUD.ink, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { fontSize: 13, color: CLOUD.body, fontWeight: '600' },
  mark: { fontSize: 13, fontWeight: '800', color: CLOUD.success },
  ready: { marginTop: 6, fontSize: 13, fontWeight: '800', color: CLOUD.primary },
});
