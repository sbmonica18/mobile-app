import { CLOUD } from '@/constants/cloudTheme';
import type { Destination } from '@/mocks/destinations';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInRight,
  FadeInUp,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const CARD_W = Dimensions.get('window').width * 0.78;
const GAP = 14;

function ScoreBadge({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    setDisplay(0);
    const steps = 20;
    const increment = score / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplay(score);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, 28);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreText}>{display}%</Text>
    </View>
  );
}

function InsightCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: Destination;
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const reduceMotion = !!useReducedMotion();
  const kenBurns = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    kenBurns.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [kenBurns, reduceMotion]);

  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * (CARD_W + GAP), index * (CARD_W + GAP), (index + 1) * (CARD_W + GAP)];
    return {
      transform: [
        { scale: interpolate(scrollX.value, input, [0.94, 1, 0.94], Extrapolation.CLAMP) },
        {
          translateY: interpolate(scrollX.value, input, [8, 0, 8], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * (CARD_W + GAP), index * (CARD_W + GAP), (index + 1) * (CARD_W + GAP)];
    const scrollShift = interpolate(scrollX.value, input, [-10, 0, 10], Extrapolation.CLAMP);
    const drift = reduceMotion
      ? 0
      : interpolate(kenBurns.value, [0, 1], [0, 14], Extrapolation.CLAMP);
    const scale = reduceMotion
      ? 1.06
      : interpolate(kenBurns.value, [0, 1], [1.06, 1.14], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: scrollShift + drift }, { scale }],
    };
  });

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(450)} style={style}>
      <Pressable onPress={onPress} style={styles.card}>
        <Animated.View style={[styles.imageWrap, imageStyle]}>
          <Image source={{ uri: item.coverImage }} style={styles.image} />
        </Animated.View>
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.55)', 'rgba(15,23,42,0.88)']}
          style={styles.overlay}
        />
        <ScoreBadge score={item.matchScore} />
        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.reason} numberOfLines={2}>
            {item.aiSummary}
          </Text>
          <View style={styles.metaRow}>
            <Meta icon="partly-sunny-outline" label={item.weather} />
            <Meta icon="leaf-outline" label={`AQI ${item.aqi}`} />
            <Meta icon="wallet-outline" label={item.budgetEstimate} />
            <Meta icon="time-outline" label={item.travelTime} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color="rgba(255,255,255,0.85)" />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

type Props = {
  destinations: Destination[];
  onSelect: (d: Destination) => void;
};

export const AiInsightCarousel = memo(function AiInsightCarousel({
  destinations,
  onSelect,
}: Props) {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  if (destinations.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.delay(220).duration(450)} style={styles.section}>
      <Text style={styles.title}>AI Insights</Text>
      <Text style={styles.subtitle}>Picked for your current context</Text>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + GAP}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {destinations.map((d, i) => (
          <InsightCard
            key={`${d.id}-${d.matchScore}`}
            item={d}
            index={i}
            scrollX={scrollX}
            onPress={() => onSelect(d)}
          />
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  section: { marginTop: 4 },
  title: {
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  subtitle: {
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  list: { gap: GAP, paddingRight: 8 },
  card: {
    width: CARD_W,
    height: 220,
    borderRadius: CLOUD.radii.card,
    overflow: 'hidden',
    backgroundColor: CLOUD.ink,
    ...CLOUD.shadows.hero,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scoreBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    minWidth: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  body: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  reason: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    fontWeight: '600',
  },
});
