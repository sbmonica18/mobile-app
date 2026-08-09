import { CLOUD } from '@/constants/cloudTheme';
import { VIBE_CHIPS, type VibeChip } from '@/mocks/vibeChips';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Chip({
  chip,
  index,
  onPress,
}: {
  chip: VibeChip;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const wash = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const washStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wash.value, [0, 1], [0, 0.22], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(wash.value, [0, 1], [0.4, 1.6], Extrapolation.CLAMP) }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInUp.delay(40 + index * 30).duration(360)}
      style={[styles.chip, style]}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 90, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) });
      }}
      onPress={() => {
        wash.value = 0;
        wash.value = withSequence(
          withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 280 }),
        );
        scale.value = withSequence(
          withTiming(0.94, { duration: 70 }),
          withTiming(1.03, { duration: 110 }),
          withTiming(1, { duration: 120 }),
        );
        void Haptics.selectionAsync();
        onPress();
      }}
    >
      <Animated.View pointerEvents="none" style={[styles.wash, washStyle]} />
      <Text style={styles.emoji}>{chip.emoji}</Text>
      <Text style={styles.chipText}>{chip.label}</Text>
    </AnimatedPressable>
  );
}

type Props = {
  /** Inserts the chip's prompt into Ask anything (does not navigate). */
  onSelect: (prompt: string) => void;
};

export const AiRecommendationChips = memo(function AiRecommendationChips({ onSelect }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Try asking:</Text>
      <View style={styles.wrap}>
        {VIBE_CHIPS.map((chip, i) => (
          <Chip
            key={chip.id}
            chip={chip}
            index={i}
            onPress={() => onSelect(chip.prompt)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: { marginTop: 4 },
  title: {
    color: CLOUD.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: CLOUD.card,
    borderWidth: 1.5,
    borderColor: CLOUD.lightBlue,
    overflow: 'hidden',
    ...CLOUD.shadows.search,
  },
  wash: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CLOUD.aiAccent,
    alignSelf: 'center',
    left: '35%',
  },
  emoji: {
    fontSize: 14,
  },
  chipText: {
    color: CLOUD.ink,
    fontSize: 13,
    fontWeight: '600',
  },
});
