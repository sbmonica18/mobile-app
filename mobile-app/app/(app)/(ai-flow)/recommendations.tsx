import { CLOUD } from '@/constants/cloudTheme';
import { getRecommendations, mockDestinations, type Destination } from '@/mocks/destinations';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPERIENCE_CATEGORIES } from '@/mocks/experienceCategories';
import { cleanPhraseLabel, matchCountLabel } from '@/utils/phraseLabel';
import { withTravelFromOrigin } from '@/utils/travelEstimate';
import {
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_H = Math.min(SCREEN_H * 0.62, 520);
const SWIPE_UP = 110;
const SWIPE_DOWN = 110;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function buildRecap(filters: { mood?: string | null; budget?: string | null; time?: string | null; travelStyle?: string | null; priority?: string | null }): string {
  const parts = [];
  if (filters.mood) {
    const m = filters.mood.toLowerCase();
    if (m === 'relax') parts.push('something relaxing');
    else if (m === 'active') parts.push('something active');
    else if (m === 'explore') parts.push('places to explore');
    else if (m === 'unwind') parts.push('somewhere to unwind');
    else parts.push(`something ${m}`);
  }
  
  if (filters.budget) {
    parts.push(filters.budget === 'Flexible' ? 'flexible on budget' : `on a ${filters.budget} budget`);
  }
  
  if (filters.time) {
    const t = filters.time.toLowerCase();
    if (t === 'one day') parts.push('with about a day');
    else if (t === 'half day') parts.push('with about half a day');
    else if (t === '2 hours') parts.push('with about 2 hours');
    else parts.push(`for a ${t} trip`);
  }
  
  if (filters.travelStyle) {
    const s = filters.travelStyle.toLowerCase();
    if (s === 'solo') parts.push('going solo');
    else if (s === 'friends') parts.push('with friends');
    else if (s === 'family') parts.push('with family');
    else if (s === 'group') parts.push('with a group');
    else parts.push(`going with ${s}`);
  }

  if (parts.length === 0) {
    if (filters.priority) {
      if (filters.priority === 'Air quality') return 'Since air quality matters most to you today, here are the cleanest options nearby.';
      if (filters.priority === 'Weather') return 'Since weather matters most to you today, here are the options with the best conditions.';
      if (filters.priority === 'Traffic') return 'Since traffic matters most to you today, here are the quickest options to reach.';
      if (filters.priority === 'Budget') return 'Since budget matters most to you today, here are the most affordable options.';
    }
    return '';
  }
  
  let prefix = `Since you're after ${parts.join(', ')}`;
  if (filters.priority) {
    if (filters.priority === 'Air quality') return `${prefix}, and air quality matters most to you today — here are the cleanest options nearby.`;
    if (filters.priority === 'Weather') return `${prefix}, and weather matters most to you today — here are the options with the best conditions.`;
    if (filters.priority === 'Traffic') return `${prefix}, and traffic matters most to you today — here are the quickest options to reach.`;
    if (filters.priority === 'Budget') return `${prefix}, and budget matters most to you today — here are the most affordable options.`;
  }

  return `${prefix} — here's what fits best today.`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({ children, onPress, onPressIn, onPressOut, style }: { children: React.ReactNode, onPress?: () => void, onPressIn?: () => void, onPressOut?: () => void, style?: any }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        if (onPressIn) onPressIn();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        if (onPressOut) onPressOut();
      }}
      onPress={onPress}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function MatchRing({ score, active }: { score: number; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const r = 22;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = withTiming(score / 100, {
      duration: reduceMotion ? 0 : 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, score, progress, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={styles.ringWrap}>
      <Svg width={56} height={56}>
        <Circle cx={28} cy={28} r={r} stroke={CLOUD.border} strokeWidth={4} fill="none" />
        <AnimatedCircle
          cx={28}
          cy={28}
          r={r}
          stroke={CLOUD.primary}
          strokeWidth={4}
          fill="none"
          strokeDasharray={`${c}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin="28, 28"
        />
      </Svg>
      <Text style={styles.ringText}>{score}%</Text>
    </View>
  );
}

function AnimatedArrowButton({ onPress }: { onPress: () => void }) {
  const reduceMotion = useReducedMotion();
  const arrowX = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      arrowX.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
    }
  }, [reduceMotion, arrowX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  const handlePressIn = () => {
    arrowX.value = withTiming(8, { duration: 150 });
  };
  const handlePressOut = () => {
    arrowX.value = withSpring(0);
  };

  return (
    <ScalePressable 
      onPress={onPress} 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      style={[styles.primaryAct, { flexDirection: 'row', justifyContent: 'center', gap: 6 }]}
    >
      <Text style={styles.primaryActText}>Explore journey</Text>
      <Animated.View style={animStyle}>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </Animated.View>
    </ScalePressable>
  );
}

function DeckCard({
  item,
  active,
  peek,
  onOpen,
  onDismiss,
  onPrevious,
  canGoPrevious = false,
}: {
  item: Destination;
  active: boolean;
  peek: boolean;
  onOpen: () => void;
  onDismiss: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const dragAxis = useSharedValue(0);
  const hasOpened = useSharedValue(false);
  const [hintNudged, setHintNudged] = useState(false);

  useEffect(() => {
    if (active && !hintNudged && !peek) {
      setHintNudged(true);
      setTimeout(() => {
        translateX.value = withSequence(
          withTiming(-15, { duration: 250, easing: Easing.out(Easing.cubic) }),
          withSpring(0, { damping: 12, stiffness: 200 })
        );
      }, 500);
    }
  }, [active, hintNudged, peek, translateX]);

  const finishDismiss = useCallback(() => {
    onDismiss();
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 1;
    cardScale.value = 1;
    dragAxis.value = 0;
  }, [onDismiss, translateY, translateX, opacity, cardScale, dragAxis]);

  const finishPrevious = useCallback(() => {
    onPrevious?.();
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 1;
    cardScale.value = 1;
    dragAxis.value = 0;
  }, [onPrevious, translateY, translateX, opacity, cardScale, dragAxis]);

  const pan = Gesture.Pan()
    .enabled(active)
    .onUpdate((e) => {
      if (dragAxis.value === 0) {
        if (e.translationX < -15 && Math.abs(e.translationX) > Math.abs(e.translationY)) {
          dragAxis.value = 2; // Horizontal → open
        } else if (Math.abs(e.translationY) > 15 && Math.abs(e.translationY) > Math.abs(e.translationX)) {
          dragAxis.value = 1; // Vertical → next / previous
        }
      }

      if (dragAxis.value === 1) {
        if (e.translationY < 0) {
          // Swipe up → next
          translateY.value = e.translationY;
          opacity.value = interpolate(e.translationY, [-SWIPE_UP * 1.4, 0], [0.35, 1], Extrapolation.CLAMP);
        } else if (canGoPrevious) {
          // Swipe down → previous
          translateY.value = e.translationY;
          opacity.value = interpolate(e.translationY, [0, SWIPE_DOWN * 1.4], [1, 0.35], Extrapolation.CLAMP);
        } else {
          // Rubber-band on first card
          translateY.value = e.translationY * 0.25;
        }
      } else if (dragAxis.value === 2) {
        if (!hasOpened.value && e.translationX < -20) {
          hasOpened.value = true;
          runOnJS(onOpen)();
        }
      }
    })
    .onEnd((e) => {
      if (dragAxis.value === 1) {
        const goNext = e.translationY < -SWIPE_UP || e.velocityY < -800;
        const goPrev =
          canGoPrevious && (e.translationY > SWIPE_DOWN || e.velocityY > 800);

        if (goNext) {
          translateY.value = withTiming(-SCREEN_H * 0.55, { duration: 240 }, () => {
            runOnJS(finishDismiss)();
          });
          opacity.value = withTiming(0, { duration: 220 });
        } else if (goPrev) {
          translateY.value = withTiming(SCREEN_H * 0.55, { duration: 240 }, () => {
            runOnJS(finishPrevious)();
          });
          opacity.value = withTiming(0, { duration: 220 });
        } else {
          translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
          opacity.value = withSpring(1);
        }
      } else if (dragAxis.value === 2) {
        hasOpened.value = false;
      }
      dragAxis.value = 0;
    });

  const style = useAnimatedStyle(() => {
    if (peek) {
      return {
        transform: [{ scale: 0.92 }, { translateY: 8 }],
        opacity: 0.6,
        zIndex: 0,
      };
    }
    return {
      transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { scale: cardScale.value }],
      opacity: opacity.value,
      zIndex: 2,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, style]}>
        <Pressable onPress={onOpen} style={{ flex: 1 }}>
          <Image source={{ uri: item.coverImage }} style={styles.cover} resizeMode="cover" />
          <View style={styles.cardBody}>
            <View style={styles.badgeRow}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color={CLOUD.aiAccent} />
                <Text style={styles.aiBadgeText}>AI match</Text>
              </View>
              <MatchRing score={item.matchScore} active={active} />
            </View>
            <Text style={styles.destName}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.weather} · AQI {item.aqi} · {item.budgetEstimate} · {item.travelTime}
            </Text>
            <Text style={styles.summary} numberOfLines={2}>
              {item.aiSummary}
            </Text>
            <View style={styles.actions}>
              <AnimatedArrowButton onPress={onOpen} />
            </View>
            {active && (
              <View style={{ position: 'absolute', right: 8, top: '45%', opacity: 0.3 }}>
                <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

type RecommendationsProps = {
  isTab?: boolean;
  /** trending = popularity-sorted nearby; seed = seedIds from URL/props */
  mode?: 'trending' | 'seed' | 'filters';
  overrideList?: Destination[];
};

export default function AIRecommendationsScreen({
  isTab = false,
  mode: modeProp,
  overrideList,
}: RecommendationsProps = {}) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phrase?: string;
    categoryId?: string;
    time?: string;
    budget?: string;
    transportMode?: string;
    priority?: string;
    mode?: string;
    seedIds?: string;
  }>();
  const storeFilters = useAiFlowStore((s) => s.filters);
  const resetFilters = useAiFlowStore((s) => s.resetFilters);
  const userOrigin = useDashboardStore((s) => s.source);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showingRemaining, setShowingRemaining] = useState(false);
  const enter = useSharedValue(0);

  const mode =
    modeProp ||
    (params.mode === 'trending' || params.mode === 'seed' ? params.mode : undefined) ||
    'filters';

  const canGoBack = !isTab && router.canGoBack();

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [enter]);

  const filters = useMemo(
    () => ({
      mood: storeFilters.mood,
      travelStyle: storeFilters.travelStyle,
      transportMode: params.transportMode || storeFilters.transportMode,
      priority: params.priority || storeFilters.priority,
      phrase: params.phrase || storeFilters.phrase,
      categoryId: params.categoryId || undefined,
      time: params.time || storeFilters.time,
      budget: params.budget || storeFilters.budget,
    }),
    [storeFilters, params.phrase, params.categoryId, params.time, params.budget, params.priority, params.transportMode],
  );

  const mainList = useMemo(() => {
    let base: Destination[];

    if (overrideList && overrideList.length > 0) {
      base = overrideList;
    } else if (mode === 'trending') {
      base = [...mockDestinations].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
    } else if (mode === 'seed' && params.seedIds) {
      const ids = params.seedIds.split(',').map((s) => s.trim()).filter(Boolean);
      const found = ids
        .map((id) => mockDestinations.find((d) => d.id === id))
        .filter((d): d is Destination => !!d);
      base = found.length > 0 ? found : getRecommendations(filters);
    } else {
      base = getRecommendations(filters);
    }

    // Drive times from the user's real location (not hardcoded mock hours)
    if (userOrigin?.latitude && userOrigin?.longitude) {
      base = withTravelFromOrigin(base, {
        latitude: userOrigin.latitude,
        longitude: userOrigin.longitude,
      });
    }

    if (seed === 0) return base;
    return [...base]
      .map((d, i) => ({
        ...d,
        matchScore: Math.max(55, Math.min(99, d.matchScore + ((i + seed) % 7) - 3)),
      }))
      .sort(() => Math.random() - 0.5)
      .sort((a, b) => b.matchScore - a.matchScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed reshuffles
  }, [filters, seed, mode, overrideList, params.seedIds, userOrigin?.latitude, userOrigin?.longitude]);

  const list = useMemo(() => {
    if (showingRemaining) {
      // Experience flow stays inside the fixed pool — never expand to full catalogue
      if (filters.categoryId) return mainList;
      const mainIds = new Set(mainList.map((d) => d.id));
      let rest = mockDestinations
        .filter((d) => !mainIds.has(d.id))
        .sort((a, b) => b.popularity - a.popularity);
      if (userOrigin?.latitude && userOrigin?.longitude) {
        rest = withTravelFromOrigin(rest, {
          latitude: userOrigin.latitude,
          longitude: userOrigin.longitude,
        });
      }
      return rest;
    }
    return mainList;
  }, [mainList, showingRemaining, userOrigin?.latitude, userOrigin?.longitude, filters.categoryId]);

  const skipped =
    mode === 'filters' &&
    !filters.mood &&
    !filters.budget &&
    !filters.time &&
    !filters.travelStyle &&
    !filters.phrase &&
    !filters.categoryId &&
    !filters.priority &&
    !filters.transportMode;

  let titleStr = 'Your matches';
  if (mode === 'trending') {
    titleStr = 'Trending nearby';
  } else if (mode === 'seed') {
    titleStr = filters.phrase || 'AI picks';
  } else if (filters.categoryId) {
    const cat = EXPERIENCE_CATEGORIES.find((c) => c.id === filters.categoryId);
    titleStr = cat?.label || titleStr;
  } else if (filters.priority) {
    titleStr = filters.priority;
  } else if (filters.mood) {
    titleStr = filters.mood;
  } else if (filters.travelStyle) {
    titleStr = filters.travelStyle;
  } else if (filters.transportMode) {
    titleStr = filters.transportMode;
  } else if (filters.budget) {
    titleStr = filters.budget;
  } else if (filters.time) {
    titleStr = filters.time;
  } else if (filters.phrase) {
    titleStr = cleanPhraseLabel(filters.phrase);
  }

  let title = skipped
    ? `Popular near you · ${matchCountLabel(list.length)}`
    : `${titleStr} · ${matchCountLabel(list.length)}`;

  if (showingRemaining) {
    title = `Other places near you · ${list.length}`;
  }

  const showRecap = !skipped && !filters.categoryId && !showingRemaining;
  const recapText = buildRecap(filters);

  const active = list[index];
  const peek = list[index + 1];

  const openDest = (id: string) => {
    router.push(`/(app)/(ai-flow)/destination/${id}` as Href);
  };

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 40 }],
  }));

  const remaining = filters.categoryId ? 0 : mockDestinations.length - mainList.length;

  const handleShowMore = () => {
    setShowingRemaining(true);
    setIndex(0);
  };

  return (
    <Animated.View style={[styles.root, { paddingTop: insets.top }, enterStyle]}>
      <View style={styles.header}>
        {canGoBack ? (
          <ScalePressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
          </ScalePressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.deckArea}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={CLOUD.primary}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                setSeed((s) => s + 1);
                setIndex(0);
                setRefreshing(false);
              }, 450);
            }}
          />
        }
      >
        {!active ? (
          list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>
                {filters.phrase
                  ? `No ${filters.phrase} destinations nearby yet — try Mountains or Nature instead.`
                  : 'No matches yet — try adjusting intent.'}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
              <Ionicons name="checkmark-circle" size={64} color={CLOUD.primary} style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: CLOUD.ink, marginBottom: 24 }}>You've seen all {list.length} places!</Text>
              {!showingRemaining && remaining > 0 ? (
                <ScalePressable onPress={handleShowMore} style={{ backgroundColor: CLOUD.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 100 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Explore {remaining} more places</Text>
                </ScalePressable>
              ) : (
                <ScalePressable onPress={() => router.back()} style={{ backgroundColor: CLOUD.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 100 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Adjust your intent</Text>
                </ScalePressable>
              )}
            </View>
          )
        ) : (
          <View style={{ flex: 1 }}>
            {showRecap && recapText ? (
              <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.recapBanner}>
                <Ionicons name="sparkles" size={14} color={CLOUD.aiAccent} />
                <Text style={styles.recapText}>{recapText}</Text>
              </Animated.View>
            ) : null}
            <View style={styles.stack}>
              {peek ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <DeckCard
                  item={peek}
                  active={false}
                  peek
                  onOpen={() => {}}
                  onDismiss={() => {}}
                />
              </View>
            ) : null}
            <DeckCard
              key={`${active.id}-${index}-${seed}`}
              item={active}
              active
              peek={false}
              onOpen={() => openDest(active.id)}
              onDismiss={() => {
                if (index < list.length - 1) setIndex((i) => i + 1);
                else setIndex(list.length);
              }}
              canGoPrevious={index > 0}
              onPrevious={() => {
                if (index > 0) setIndex((i) => i - 1);
              }}
            />
          </View>
        </View>
        )}
        {active ? (
          <Text style={styles.hint}>
            Swipe up next · Swipe down previous · {index + 1}/{mainList.length}
          </Text>
        ) : null}
      </Animated.ScrollView>
      {!isTab ? <BottomTabBar activeTab="Explore" /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  recapBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    ...CLOUD.shadows.hero,
  },
  recapText: {
    flex: 1,
    fontSize: 14,
    color: CLOUD.ink,
    lineHeight: 20,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  deckArea: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  stack: {
    height: CARD_H + 24,
    width: '100%',
    maxWidth: SCREEN_W - 32,
    alignSelf: 'center',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CLOUD.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.hero,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: CLOUD.soft,
  },
  cardBody: { padding: 16, gap: 8, flex: 1 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLOUD.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  aiBadgeText: { color: CLOUD.aiAccent, fontWeight: '700', fontSize: 12 },
  ringWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  destName: { fontSize: 22, fontWeight: '800', color: CLOUD.ink },
  meta: { fontSize: 13, color: CLOUD.muted, fontWeight: '500' },
  summary: { fontSize: 14, color: CLOUD.body, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  primaryAct: {
    flex: 1,
    backgroundColor: CLOUD.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActText: { color: '#fff', fontWeight: '700' },
  secondaryAct: {
    flex: 1,
    borderWidth: 1,
    borderColor: CLOUD.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: CLOUD.soft,
  },
  secondaryActText: { color: CLOUD.ink, fontWeight: '600' },
  hint: {
    textAlign: 'center',
    marginTop: 16,
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: CLOUD.muted,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
});
