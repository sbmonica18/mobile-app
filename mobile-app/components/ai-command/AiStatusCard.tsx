import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const STATUS_ROWS = [
  'Weather synced',
  'Traffic synced',
  'Location active',
  'Personalization learning',
  'Destination engine online',
];

/** Always-visible AI Ready checklist (details shown steadily). */
export const AiStatusCard = memo(function AiStatusCard() {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse, reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.card}>
      <View style={styles.summaryRow}>
        <Animated.View style={[styles.readyDot, dotStyle]} />
        <Text style={styles.summaryText}>
          AI Ready — synced with weather, traffic & your location
        </Text>
      </View>

      <View style={styles.detailList}>
        {STATUS_ROWS.map((label) => (
          <View key={label} style={styles.row}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
            <Text style={styles.rowText}>{label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readyDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: CLOUD.success,
  },
  summaryText: {
    flex: 1,
    color: CLOUD.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  detailList: {
    marginTop: 12,
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CLOUD.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CLOUD.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    color: CLOUD.body,
    fontSize: 13,
    fontWeight: '500',
  },
});
