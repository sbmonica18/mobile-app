import { CLOUD } from '@/constants/cloudTheme';
import { mockDestinations, type Destination } from '@/mocks/destinations';
import { placeCover } from '@/mocks/placeImages';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

function thumbUrl(url: string) {
  return url.replace(/w=\d+/, 'w=480').replace(/q=\d+/, 'q=70');
}

function GlowPulseButton({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  const reduceMotion = !!useReducedMotion();
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);
  const shadow = useSharedValue(0);
  const isPressed = useSharedValue(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.03, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    sweep.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 3600 }),
      ),
      -1,
      false,
    );
  }, [pulse, reduceMotion, sweep]);

  const anim = useAnimatedStyle(() => {
    const pulseScale = isPressed.value ? 1 : pulse.value;
    return {
      transform: [{ scale: pulseScale * press.value }],
      shadowOpacity: 0.18 + shadow.value * 0.12,
      shadowRadius: 18 + shadow.value * 8,
    };
  });

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 0.5, 1], [0, 0.35, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(sweep.value, [0, 1], [-40, 260], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Let's Plan Your Trip"
      onPressIn={() => {
        isPressed.value = 1;
        press.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        shadow.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        isPressed.value = 0;
        press.value = withSpring(1, { damping: 14, stiffness: 220 });
        shadow.value = withTiming(0, { duration: 180 });
      }}
      onPress={() => {
        press.value = withSequence(
          withSpring(0.94, { damping: 16, stiffness: 380 }),
          withSpring(1.02, { damping: 12, stiffness: 280 }),
          withSpring(1, { damping: 14, stiffness: 220 }),
        );
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <Animated.View style={[styles.ctaOuter, anim]}>
        <LinearGradient
          colors={[CLOUD.primary, '#4F46E5', CLOUD.primary]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.cta}
        >
          <Animated.View pointerEvents="none" style={[styles.ctaSweep, sweepStyle]} />
          {children}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function ShowcaseCard({
  item,
  index,
  columns,
  revealed,
}: {
  item: Destination;
  index: number;
  columns: number;
  revealed: boolean;
}) {
  const reduceMotion = !!useReducedMotion();
  const uri = thumbUrl(placeCover(item.id, item.coverImage));

  const body = (
    <View style={styles.card} pointerEvents="none" accessible={false}>
      <Image
        source={{ uri }}
        style={styles.thumb}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );

  if (!revealed) {
    return (
      <View style={[styles.cardSlot, styles.cardHidden]} pointerEvents="none">
        {body}
      </View>
    );
  }

  if (reduceMotion) {
    return <View style={styles.cardSlot}>{body}</View>;
  }

  return (
    <Animated.View
      style={styles.cardSlot}
      entering={FadeInUp.delay((index % columns) * 45)
        .duration(380)
        .springify()
        .damping(16)}
    >
      {body}
    </Animated.View>
  );
}

export default function DestinationShowcaseScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const resetFilters = useAiFlowStore((s) => s.resetFilters);

  const columns = width >= 420 ? 3 : 2;
  const destinations = mockDestinations;
  const count = destinations.length;

  const revealedRef = useRef(new Set<string>());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  // Reveal the first viewport immediately so the top of the grid isn't blank for a frame.
  useEffect(() => {
    const seed = destinations.slice(0, columns * 3).map((d) => d.id);
    const next = new Set(revealedRef.current);
    seed.forEach((id) => next.add(id));
    revealedRef.current = next;
    setRevealedIds(new Set(next));
  }, [columns, destinations]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      let changed = false;
      const next = new Set(revealedRef.current);
      for (const token of viewableItems) {
        const id = (token.item as Destination | undefined)?.id;
        if (id && !next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (changed) {
        revealedRef.current = next;
        setRevealedIds(new Set(next));
      }
    },
  ).current;

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 18, minimumViewTime: 40 }),
    [],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)' as Href);
  }, [router]);

  const continueToIntent = useCallback(() => {
    resetFilters();
    router.push('/(app)/(ai-flow)/intent' as Href);
  }, [resetFilters, router]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Destination>) => (
      <ShowcaseCard
        item={item}
        index={index}
        columns={columns}
        revealed={revealedIds.has(item.id)}
      />
    ),
    [columns, revealedIds],
  );

  const keyExtractor = useCallback((item: Destination) => item.id, []);

  const listHeader = (
    <Animated.View entering={FadeIn.duration(360)} style={styles.headerCopy}>
      <Text style={styles.title}>
        <Text style={styles.titleEmoji}>✨ </Text>
        {count} Destinations, One AI
      </Text>
      <Text style={styles.subtitle}>Here{"'"}s a taste of everywhere UrbanLens knows.</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </Pressable>
      </View>

      <FlatList
        data={destinations}
        key={columns}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={columns}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={columns * 4}
        maxToRenderPerBatch={columns * 4}
        windowSize={7}
        removeClippedSubviews
        style={styles.list}
      />

      <View style={styles.ctaDock}>
        <GlowPulseButton onPress={continueToIntent}>
          <Text style={styles.ctaText}>Let{"'"}s Plan Your Trip →</Text>
        </GlowPulseButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CLOUD.bg,
  },
  topBar: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerCopy: {
    paddingHorizontal: 4,
    paddingBottom: 20,
    paddingTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: CLOUD.ink,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  titleEmoji: {
    fontSize: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: CLOUD.muted,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    gap: 12,
    marginBottom: 14,
  },
  cardSlot: {
    flex: 1,
  },
  cardHidden: {
    opacity: 0,
  },
  card: {
    flex: 1,
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: CLOUD.soft,
  },
  cardName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: CLOUD.body,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  ctaDock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: CLOUD.bg,
    borderTopWidth: 1,
    borderTopColor: CLOUD.border,
    alignItems: 'center',
  },
  ctaOuter: {
    width: '100%',
    maxWidth: 420,
    borderRadius: CLOUD.radii.button,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cta: {
    height: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 8,
  },
  ctaSweep: {
    position: 'absolute',
    width: 56,
    height: '140%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '18deg' }],
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
