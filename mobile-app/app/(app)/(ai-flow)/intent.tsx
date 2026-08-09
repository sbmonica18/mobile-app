import { CLOUD } from '@/constants/cloudTheme';
import {
  BUDGETS,
  MOOD_ICONS,
  MOODS,
  TIME_OPTIONS,
  TRAVEL_STYLES,
  TRANSPORT_MODES,
  PRIORITIES,
  type Mood,
} from '@/mocks/intentOptions';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useProfilePreferencesStore } from '@/store/profilePreferencesStore';
import { getRecommendations } from '@/mocks/destinations';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar } from '@/components/BottomTabBar';

const PAGES = [
  {
    key: 'mood',
    question: "What's the mood?",
    options: MOODS as readonly string[],
    field: 'mood' as const,
  },
  {
    key: 'budget',
    question: "What's your budget?",
    options: BUDGETS as readonly string[],
    field: 'budget' as const,
  },
  {
    key: 'time',
    question: 'How much time do you have?',
    options: TIME_OPTIONS as readonly string[],
    field: 'time' as const,
  },
  {
    key: 'style',
    question: "Who's travelling?",
    options: TRAVEL_STYLES as readonly string[],
    field: 'travelStyle' as const,
  },
  {
    key: 'transport',
    question: 'How are you getting there?',
    options: TRANSPORT_MODES as readonly string[],
    field: 'transportMode' as const,
  },
  {
    key: 'priority',
    question: 'What matters most today?',
    options: PRIORITIES as readonly string[],
    field: 'priority' as const,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      onPress={onPress}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}

function SelectChip({
  label,
  selected,
  onSelect,
  icon,
  fullWidth,
  index,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const fill = useSharedValue(selected ? 1 : 0);
  
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: interpolate(fill.value, [0, 1], [0.8, 1]) }],
  }));

  useEffect(() => {
    fill.value = withTiming(selected ? 1 : 0, { duration: 250, easing: Easing.out(Easing.ease) });
  }, [selected, fill]);

  const handle = () => {
    scale.value = withSpring(1.08, { damping: 12, stiffness: 220 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    });
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(16).stiffness(150)} style={fullWidth ? { width: '100%' } : undefined}>
      <ScalePressable onPress={handle}>
        <Animated.View
          style={[
            styles.chip,
            fullWidth && styles.chipFull,
            styles.chipIdle,
            selected && { borderColor: CLOUD.primary },
            anim,
            { overflow: 'hidden' }
          ]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, styles.chipSelected, fillStyle, { borderRadius: 20 }]} />
          {icon ? (
            <Ionicons name={icon} size={22} color={selected ? '#fff' : CLOUD.primary} />
          ) : null}
          <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
          {selected && (
            <Animated.View entering={FadeIn.duration(150)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </Animated.View>
          )}
        </Animated.View>
      </ScalePressable>
    </Animated.View>
  );
}


function AnimatedCount({ count }: { count: number }) {
  const display = useSharedValue(count);
  const [val, setVal] = useState(count);

  useEffect(() => {
    display.value = withTiming(count, { duration: 300 }, () => {
      // Optional JS callback if needed
    });
    // Interval just to update text fast enough without re-renders getting missed
    const t = setInterval(() => {
      setVal(Math.round(display.value));
    }, 16);
    return () => clearInterval(t);
  }, [count, display]);

  return <Text style={{ fontWeight: '800', color: CLOUD.primary }}>{val}</Text>;
}


function CustomInput({ field, onDone }: { field: 'budget' | 'time', onDone: () => void }) {
  const [text, setText] = useState('');
  const [unit, setUnit] = useState(field === 'time' ? 'Hours' : '');
  const setFilters = useAiFlowStore((s) => s.setFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) {
        if (field === 'budget') {
          setFilters({ budget: text });
        } else if (field === 'time') {
          setFilters({ time: `${text} ${unit}` });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, unit, field, setFilters]);

  return (
    <Animated.View entering={FadeInUp.duration(200)} style={styles.customInputContainer}>
      {field === 'budget' && <Text style={styles.prefix}>₹</Text>}
      <TextInput
        style={styles.input}
        placeholder={field === 'budget' ? 'Amount' : 'Duration'}
        placeholderTextColor={CLOUD.muted}
        keyboardType="numeric"
        value={text}
        onChangeText={setText}
        autoFocus
      />
      {field === 'time' && (
        <Pressable onPress={() => setUnit(unit === 'Hours' ? 'Days' : 'Hours')} style={styles.unitToggle}>
          <Text style={styles.unitText}>{unit}</Text>
        </Pressable>
      )}
      <ScalePressable onPress={onDone} style={styles.doneBtn}>
        <Ionicons name="checkmark" size={20} color="#fff" />
      </ScalePressable>
    </Animated.View>
  );
}

export default function IntentSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const [page, setPage] = useState(0);
  const [customInputPage, setCustomInputPage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const filters = useAiFlowStore((s) => s.filters);
  const setFilters = useAiFlowStore((s) => s.setFilters);
  const resetFilters = useAiFlowStore((s) => s.resetFilters);
  const preferences = useProfilePreferencesStore((s) => s.preferences);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exiting = useSharedValue(0);
  const progress = useSharedValue(1 / PAGES.length);
  const liveCount = useMemo(() => getRecommendations(filters).length, [filters]);
  const bgColors = ['#e0f2fe88', '#fef3c788', '#dcfce788', '#f3e8ff88', '#ffedd588', '#e0e7ff88'];
  const bgWash = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(bgColors[page % bgColors.length], { duration: 400 }),
    };
  });

  // Prefill from Profile preferences once if Intent filters are still empty
  useEffect(() => {
    const empty =
      !filters.travelStyle && !filters.transportMode && !filters.budget && !filters.mood;
    if (!empty) return;
    const patch: Record<string, string> = {};
    if (preferences.travelStyle) patch.travelStyle = preferences.travelStyle;
    if (preferences.transportMode) patch.transportMode = preferences.transportMode;
    if (preferences.budgetTier) patch.budget = preferences.budgetTier;
    if (Object.keys(patch).length) setFilters(patch);
    // only on mount / when prefs hydrate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.travelStyle, preferences.transportMode, preferences.budgetTier]);


  const goRecommendations = useCallback(() => {
    exiting.value = withTiming(1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
    setTimeout(() => {
      router.push('/(app)/(ai-flow)/recommendations' as Href);
    }, 300);
  }, [exiting]);

  useFocusEffect(
    useCallback(() => {
      // When navigating back from recommendations, reset the exit animation
      exiting.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    }, [exiting])
  );

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setPage(next);
    progress.value = withSpring((next + 1) / PAGES.length, { damping: 12, stiffness: 100 });
  };

  const selectAndAdvance = (field: (typeof PAGES)[number]['field'], value: string) => {
    setFilters({ [field]: value });
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      if (page >= PAGES.length - 1) {
        goRecommendations();
      } else {
        goTo(page + 1);
      }
    }, 350);
  };

  const exitStyle = useAnimatedStyle(() => ({
    opacity: 1 - exiting.value,
    transform: [{ translateY: exiting.value * -48 }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const selectedFor = (field: (typeof PAGES)[number]['field']) => {
    if (field === 'mood') return filters.mood;
    if (field === 'budget') return filters.budget;
    if (field === 'time') return filters.time;
    
    if (field === 'travelStyle') return filters.travelStyle;
    if (field === 'transportMode') return filters.transportMode;
    return filters.priority;

  };

  return (
    <Animated.View style={[styles.root, { paddingTop: insets.top }, exitStyle]}>
      <View style={styles.header}>
        <ScalePressable onPress={() => (page === 0 ? router.back() : goTo(page - 1))} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </ScalePressable>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <Text style={styles.eyebrow}>Tell UrbanLens what you're looking for</Text>

      <Animated.View style={[StyleSheet.absoluteFill, bgWash, { top: '35%', bottom: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40 }]} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        style={styles.pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / width);
          setPage(next);
          progress.value = withSpring((next + 1) / PAGES.length, { damping: 12, stiffness: 100 });
        }}
      >
        {PAGES.map((p) => (
          <View key={p.key} style={[styles.page, { width }]} collapsable={false}>
            <Animated.Text key={p.key + "-title"} entering={FadeInUp.duration(200)} style={styles.question}>
              {p.question}
              {p.field === 'transportMode' || p.field === 'priority' ? (
                <Text style={styles.optionalLabel}>{"\nOptional — helps us fine-tune"}</Text>
              ) : null}
            </Animated.Text>
            <View style={[styles.options, p.field === 'mood' && styles.optionsCol]}>
              {[...p.options, (p.field === 'budget' || p.field === 'time') ? 'Other' : null].filter(Boolean).map((opt, optIndex) => (
                <SelectChip
                  key={opt as string}
                  label={opt as string}
                  index={optIndex}
                  selected={
                    (opt === 'Other' ? customInputPage === p.field : (selectedFor(p.field) === opt || (p.field === 'transportMode' && filters.transportMode === opt) || (p.field === 'priority' && filters.priority === opt)))
                  }
                  fullWidth={p.field === 'mood'}
                  icon={p.field === 'mood' ? MOOD_ICONS[opt as Mood] : undefined}
                  onSelect={() => {
                    if (opt === 'Other') {
                      setCustomInputPage(p.field);
                    } else {
                      setCustomInputPage(null);
                      selectAndAdvance(p.field, opt as string);
                    }
                  }}
                />
              ))}
              {customInputPage === p.field && (
                <CustomInput
                  field={p.field as 'budget' | 'time'}
                  onDone={() => {
                    if (page >= PAGES.length - 1) goRecommendations();
                    else goTo(page + 1);
                  }}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, color: CLOUD.muted, fontWeight: '600' }}>
          <AnimatedCount count={liveCount} /> destinations match so far
        </Text>
        {liveCount <= 20 && liveCount > 0 && (
          <Pressable onPress={goRecommendations} style={{ marginTop: 8 }}>
            <Text style={{ color: CLOUD.primary, fontSize: 13, fontWeight: '600' }}>
              View all {liveCount} destinations →
            </Text>
          </Pressable>
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <ScalePressable onPress={() => { resetFilters(); goRecommendations(); }} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </ScalePressable>
        <ScalePressable
          onPress={() => {
            if (page >= PAGES.length - 1) goRecommendations();
            else goTo(page + 1);
          }}
          style={styles.nextBtn}
        >
          <Text style={styles.nextText}>
            {page >= PAGES.length - 1 ? 'Find destinations' : 'Next →'}
          </Text>
        </ScalePressable>
      </View>
      <BottomTabBar activeTab="Explore" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CLOUD.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLOUD.border,
  },
  dotActive: {
    backgroundColor: CLOUD.primary,
    width: 18,
    borderRadius: 5,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    backgroundColor: CLOUD.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: CLOUD.primary,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  eyebrow: {
    textAlign: 'center',
    color: CLOUD.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  pager: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: CLOUD.ink,
    marginBottom: 22,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  optionsCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  chip: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: CLOUD.card,
    ...CLOUD.shadows.card,
  },
  chipFull: { width: '100%' },
  chipIdle: {
    borderColor: CLOUD.border,
    backgroundColor: CLOUD.card,
  },
  chipSelected: { backgroundColor: CLOUD.primary },
  customInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: CLOUD.primary,
    ...CLOUD.shadows.card,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: CLOUD.ink,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  unitToggle: {
    backgroundColor: CLOUD.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  doneBtn: {
    backgroundColor: CLOUD.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionalLabel: { fontSize: 13, color: CLOUD.muted, fontWeight: '500', marginTop: 4 },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  chipLabelSelected: { color: '#fff' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  skipText: { color: CLOUD.muted, fontWeight: '600', fontSize: 15 },
  nextBtn: {
    backgroundColor: CLOUD.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
