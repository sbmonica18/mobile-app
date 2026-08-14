import { CLOUD } from '@/constants/cloudTheme';
import type { WhatChangedSnapshot } from '@/services/intelligence/intelligenceTypes';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = {
  data: WhatChangedSnapshot;
  onRebuild?: () => void;
};

export function WhatChangedCard({ data, onRebuild }: Props) {
  return (
    <Animated.View entering={FadeInUp.delay(60).duration(400)} style={styles.card}>
      <Text style={styles.kicker}>WHAT CHANGED SINCE YOUR LAST LOOK?</Text>
      <Text style={styles.title}>{data.destinationName}</Text>
      {data.items.map((item) => (
        <View key={item.key} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.change}>
            {item.from} → <Text style={{ color: item.worse ? CLOUD.warning : CLOUD.success }}>{item.to}</Text>
          </Text>
        </View>
      ))}
      <Text style={styles.interp}>{data.interpretation}</Text>
      {onRebuild ? (
        <Pressable style={styles.cta} onPress={onRebuild}>
          <Text style={styles.ctaText}>Build an updated plan →</Text>
        </Pressable>
      ) : null}
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
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8, color: CLOUD.aiAccent },
  title: { fontSize: 17, fontWeight: '800', color: CLOUD.ink },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CLOUD.border,
  },
  label: { fontSize: 13, fontWeight: '700', color: CLOUD.body, width: 70 },
  change: { flex: 1, fontSize: 13, color: CLOUD.muted, textAlign: 'right' },
  interp: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: CLOUD.ink,
    fontWeight: '700',
  },
  cta: { marginTop: 4, paddingVertical: 8 },
  ctaText: { color: CLOUD.primary, fontWeight: '800' },
});
