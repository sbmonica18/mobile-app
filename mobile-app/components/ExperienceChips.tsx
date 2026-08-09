import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { CLOUD } from '@/constants/cloudTheme';
import { EXPERIENCE_CATEGORIES, ExperienceCategory } from '@/mocks/experienceCategories';
import { ExperienceRefineSheet } from './ExperienceRefineSheet';

const CARD_W = 132;

function ScalePressable({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: (1 - scale.value) * -8 }],
  }));
  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

function ExperienceCard({
  chip,
  index,
  scrollX,
  onPress,
}: {
  chip: ExperienceCategory;
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * (CARD_W + 12), index * (CARD_W + 12), (index + 1) * (CARD_W + 12)];
    return {
      transform: [
        { translateY: interpolate(scrollX.value, input, [10, 0, 10], Extrapolation.CLAMP) },
        { scale: interpolate(scrollX.value, input, [0.96, 1, 0.96], Extrapolation.CLAMP) },
      ],
    };
  });

  const tint = chip.gradient?.[1] || CLOUD.lightBlue;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(360)} style={style}>
      <ScalePressable style={styles.card} onPress={onPress}>
        <LinearGradient
          colors={chip.gradient || [CLOUD.soft, CLOUD.lightBlue]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.iconWrap, { backgroundColor: '#fff' }]}>
          <Ionicons name={chip.icon as any} size={22} color={CLOUD.ink} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {chip.label}
        </Text>
        <Text style={styles.cardCount}>{chip.placesCount ?? 40} Places</Text>
        <View style={[styles.accentBar, { backgroundColor: tint }]} />
      </ScalePressable>
    </Animated.View>
  );
}

export function ExperienceChips() {
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | null>(null);
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.teaserLabel}>Need inspiration? Start with an experience</Text>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        decelerationRate="fast"
        snapToInterval={CARD_W + 12}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {EXPERIENCE_CATEGORIES.map((chip, index) => (
          <ExperienceCard
            key={chip.id}
            chip={chip}
            index={index}
            scrollX={scrollX}
            onPress={() => setSelectedCategory(chip)}
          />
        ))}
      </Animated.ScrollView>

      {selectedCategory ? (
        <ExperienceRefineSheet
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  teaserLabel: {
    marginBottom: 14,
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  chipRow: { gap: 12, paddingRight: 8, paddingBottom: 4 },
  card: {
    width: CARD_W,
    height: 148,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CLOUD.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...CLOUD.shadows.search,
  },
  cardTitle: {
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  cardCount: {
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.55,
  },
});
