import {
  AiHeroSection,
  AiOrbitSuggestions,
  AiPromptComposer,
  AiReasoningTimeline,
  AiStatusCard,
  type OrbitOrigin,
} from '@/components/ai-command';
import { HomeShell } from '@/components/HomeDashboard';
import { CLOUD } from '@/constants/cloudTheme';
import { findDestinationByName, getRecommendations } from '@/mocks/destinations';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { cleanPhraseLabel } from '@/utils/phraseLabel';
import { Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

function preferenceFromPrompt(text: string): string {
  const q = text.toLowerCase();
  if (q.includes('family')) return 'family';
  if (q.includes('weekend')) return 'weekend';
  if (q.includes('peaceful') || q.includes('calm') || q.includes('hidden')) return 'peaceful';
  if (q.includes('sunset') || q.includes('photo')) return 'sunset';
  if (q.includes('food')) return 'food';
  if (q.includes('adventure')) return 'adventure';
  if (q.includes('road')) return 'road';
  if (q.includes('nature') || q.includes('mountain')) return 'nature';
  if (q.includes('beach')) return 'beach';
  if (q.includes('heritage') || q.includes('fort')) return 'heritage';
  if (q.includes('wildlife') || q.includes('safari')) return 'wildlife';
  return 'planner';
}

export default function AiScreen() {
  const router = useRouter();
  const recordPreference = useDashboardStore((s) => s.recordPreference);
  const loadLists = useDashboardStore((s) => s.loadLists);
  const setFilters = useAiFlowStore((s) => s.setFilters);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const orbitBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionHeights = useRef({ hero: 0, status: 0 });

  const composerScrollY = () => {
    const gap = 16;
    const { hero, status } = sectionHeights.current;
    return Math.max(0, hero + 10 + status + gap - 20);
  };

  const ensureComposerVisible = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: composerScrollY(), animated: true });
    }, 100);
  }, []);

  const [prompt, setPrompt] = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const [sparkleWindow, setSparkleWindow] = useState<OrbitOrigin | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  const dismissOrbit = useCallback(() => {
    setOrbitOpen(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
    setComposerFocused(false);
  }, []);

  const openOrbit = useCallback(() => {
    if (prompt.trim().length === 0) {
      setOrbitOpen(true);
    }
  }, [prompt]);

  const resetResult = useCallback(() => {
    setError(null);
    setIsPlanning(false);
    setPrompt('');
  }, []);

  const handOffToRecommendations = useCallback(
    (query: string, placeNames: string[]) => {
      const label = cleanPhraseLabel(query);
      setFilters({ phrase: label });

      const fromLocal = getRecommendations({ phrase: query });
      if (fromLocal.length === 0) {
        setIsPlanning(false);
        setError("Couldn't find a match for that — try rephrasing (e.g. nature, weekend, family).");
        return;
      }

      const localIds = fromLocal.map((d) => d.id);
      const fromPlanner = placeNames
        .map((name) => findDestinationByName(name)?.id)
        .filter((id): id is string => !!id && localIds.includes(id));

      const ordered = Array.from(new Set([...fromPlanner, ...localIds])).slice(0, 8);

      router.push(
        `/(app)/(ai-flow)/recommendations?mode=seed&seedIds=${ordered.join(',')}&phrase=${encodeURIComponent(label)}` as Href,
      );
      setPrompt('');
      setIsPlanning(false);
      setError(null);
    },
    [router, setFilters],
  );

  const runPrompt = useCallback(
    (text: string, preference?: string) => {
      const value = text.trim();
      if (!value) return;
      setOrbitOpen(false);
      setPrompt(value);
      setIsPlanning(true);
      setError(null);
      recordPreference(preference || preferenceFromPrompt(value));

      // Match against the curated catalogue immediately (no backend round-trip).
      // Waiting on /ai/planner caused empty beach results + multi-second hangs.
      const local = getRecommendations({ phrase: value });
      if (local.length === 0) {
        setIsPlanning(false);
        setError("Couldn't find a match for that — try rephrasing (e.g. beach, heritage, wildlife, weekend).");
        return;
      }
      handOffToRecommendations(
        value,
        local.map((d) => d.name),
      );
    },
    [handOffToRecommendations, recordPreference],
  );

  const onChangePrompt = useCallback(
    (text: string) => {
      setPrompt(text);
      if (orbitOpen && text.length > 0) {
        setOrbitOpen(false);
      }
    },
    [orbitOpen],
  );

  const fillSuggestion = useCallback(
    (text: string) => {
      setPrompt(text);
      setOrbitOpen(false);
      setComposerFocused(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        ensureComposerVisible();
      });
    },
    [ensureComposerVisible],
  );

  const clearPrompt = useCallback(() => {
    setPrompt('');
    setOrbitOpen(true);
    setComposerFocused(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      ensureComposerVisible();
    });
  }, [ensureComposerVisible]);

  const onComposerFocus = useCallback(
    (focused: boolean) => {
      setComposerFocused(focused);
      if (focused) {
        if (orbitBlurTimer.current) {
          clearTimeout(orbitBlurTimer.current);
          orbitBlurTimer.current = null;
        }
        setOrbitOpen(prompt.trim().length === 0);
        ensureComposerVisible();
      } else {
        orbitBlurTimer.current = setTimeout(() => {
          setOrbitOpen(false);
          orbitBlurTimer.current = null;
        }, 160);
      }
    },
    [ensureComposerVisible, prompt],
  );

  const showIdle = !isPlanning && !error;

  return (
    <HomeShell>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {showIdle ? (
              <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(250)}>
                <Pressable disabled={!orbitOpen} onPress={dismissOrbit}>
                  <View
                    onLayout={(e) => {
                      sectionHeights.current.hero = e.nativeEvent.layout.height;
                    }}
                    pointerEvents={orbitOpen ? 'none' : 'auto'}
                  >
                    <AiHeroSection
                      onOrbPress={() => {
                        setComposerFocused(true);
                        openOrbit();
                        inputRef.current?.focus();
                        ensureComposerVisible();
                      }}
                    />
                  </View>
                </Pressable>

                <View style={styles.stack}>
                  <Pressable disabled={!orbitOpen} onPress={dismissOrbit}>
                    <Animated.View
                      entering={FadeInUp.delay(80).duration(420)}
                      onLayout={(e) => {
                        sectionHeights.current.status = e.nativeEvent.layout.height;
                      }}
                      pointerEvents={orbitOpen ? 'none' : 'auto'}
                    >
                      <AiStatusCard />
                    </Animated.View>
                  </Pressable>

                  <Animated.View entering={FadeInUp.delay(140).duration(420)} style={styles.askBlock}>
                    <AiPromptComposer
                      embedded
                      inputRef={inputRef}
                      value={prompt}
                      onChangeText={onChangePrompt}
                      onSubmit={() => runPrompt(prompt)}
                      focused={composerFocused}
                      orbitActive={orbitOpen || composerFocused}
                      onFocusChange={onComposerFocus}
                      onSparklePress={openOrbit}
                      onSparkleWindow={setSparkleWindow}
                      onClear={clearPrompt}
                    />
                    <AiOrbitSuggestions
                      open={orbitOpen}
                      onSelect={fillSuggestion}
                      sparkleWindow={sparkleWindow}
                    />
                  </Animated.View>

                  {orbitOpen ? (
                    <Pressable style={styles.belowDismiss} onPress={dismissOrbit} />
                  ) : null}
                </View>
              </Animated.View>
            ) : null}

            {isPlanning || error ? (
              <Animated.View entering={FadeIn.duration(350)} style={styles.active}>
                {isPlanning ? <AiReasoningTimeline /> : null}

                {error ? (
                  <View style={styles.errorCard}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retry} onPress={resetResult}>
                      <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                  </View>
                ) : null}
              </Animated.View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HomeShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: CLOUD.pad,
    paddingBottom: 36,
  },
  stack: {
    gap: 16,
    marginTop: 10,
    paddingBottom: 24,
  },
  askBlock: {
    zIndex: 20,
    elevation: 12,
    overflow: 'visible',
  },
  belowDismiss: {
    minHeight: 220,
  },
  active: {
    paddingTop: 12,
    gap: 16,
    paddingBottom: 24,
  },
  errorCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  errorText: {
    color: '#B45309',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: CLOUD.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
