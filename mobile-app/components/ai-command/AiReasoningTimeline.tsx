import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const STAGES = [
  'Understanding request',
  'Finding destinations',
  'Checking weather',
  'Analyzing traffic',
  'Calculating budget',
  'Ranking experiences',
  'Preparing recommendations',
];

export const AiReasoningTimeline = memo(function AiReasoningTimeline() {
  const reduceMotion = !!useReducedMotion();
  const [step, setStep] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, reduceMotion ? 180 : 420);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    progress.value = withTiming((step + 1) / STAGES.length, {
      duration: reduceMotion ? 120 : 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reduceMotion, step]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.card}>
      <Text style={styles.title}>AI is thinking</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <View style={styles.list}>
        {STAGES.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <Animated.View
              key={label}
              entering={FadeInUp.delay(i * 40).duration(280)}
              style={styles.row}
            >
              <View
                style={[
                  styles.icon,
                  done && styles.iconDone,
                  active && styles.iconActive,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <View style={[styles.dot, active && styles.dotActive]} />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  done && styles.labelDone,
                  active && styles.labelActive,
                ]}
              >
                {label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  title: {
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 12,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: CLOUD.soft,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: CLOUD.primary,
  },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: CLOUD.success,
  },
  iconActive: {
    backgroundColor: CLOUD.lightBlue,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CLOUD.muted,
  },
  dotActive: {
    backgroundColor: CLOUD.primary,
  },
  label: {
    color: CLOUD.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  labelDone: {
    color: CLOUD.body,
  },
  labelActive: {
    color: CLOUD.ink,
    fontWeight: '700',
  },
});
