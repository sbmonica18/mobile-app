import {
  AchievementsRow,
  EnvironmentalSummary,
  JourneyHero,
  JourneyHighlights,
  JourneyStatisticsGrid,
  JourneyStoryCard,
  JourneyTimeline,
  MemoryGallery,
  RouteReplay,
  SaveToast,
  StoryShareCard,
  TravelScoreRing,
} from '@/components/journey-story/JourneyStoryKit';
import { CLOUD } from '@/constants/cloudTheme';
import { persistJourneyStoryRemote } from '@/services/journeyStoryApi';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useJourneyStoryStore } from '@/store/journeyStoryStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JourneyStoryScreen() {
  const insets = useSafeAreaInsets();
  const story = useJourneyStoryStore((s) => s.current);
  const saveToVault = useJourneyStoryStore((s) => s.saveToVault);
  const toggleMemoryFavorite = useJourneyStoryStore((s) => s.toggleMemoryFavorite);
  const clearJourneySession = useDashboardStore((s) => s.clearJourneySession);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [toast, setToast] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!story) {
      router.replace('/(app)/(tabs)' as Href);
    }
  }, [story]);

  // Completed trips auto-land in Travel Vault (don't require a manual Save tap).
  useEffect(() => {
    if (!story) return;
    let cancelled = false;
    void (async () => {
      const saved = await saveToVault(story);
      if (cancelled || !saved) return;
      if (isAuthenticated && !isGuest) {
        void persistJourneyStoryRemote(saved);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-run when AI narrative/score upgrades the story; ignore savedToVault flips.
  }, [story?.id, story?.narrative, story?.travelScore, saveToVault, isAuthenticated, isGuest]);

  if (!story) {
    return <View style={styles.fallback} />;
  }

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    const saved = await saveToVault(story);
    if (saved && isAuthenticated && !isGuest) {
      void persistJourneyStoryRemote(saved);
    }
    setToast(true);
    setSaving(false);
    setTimeout(() => setToast(false), 2200);
  };

  const onVault = async () => {
    if (!story.savedToVault) await onSave();
    router.push('/(app)/travel-vault' as Href);
  };

  const onDone = () => {
    clearJourneySession();
    router.replace('/(app)/(tabs)' as Href);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF2FF', CLOUD.bg, '#F0FDFA']} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <Pressable onPress={onDone} style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="close" size={22} color={CLOUD.ink} />
        </Pressable>
        <Text style={styles.topTitle}>AI Journey Story</Text>
        <Pressable onPress={onVault} style={styles.iconBtn}>
          <Ionicons name="folder-open-outline" size={20} color={CLOUD.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        <JourneyHero story={story} />
        <JourneyStoryCard narrative={story.narrative} />
        <RouteReplay
          coordinates={story.routeCoordinates}
          destinationName={story.destinationName}
        />
        <JourneyTimeline stops={story.timeline} />
        <JourneyStatisticsGrid stats={story.statistics} />
        <JourneyHighlights items={story.highlights} />
        <MemoryGallery
          memories={story.memories}
          onToggleFavorite={toggleMemoryFavorite}
        />
        <EnvironmentalSummary points={story.environment} />
        <TravelScoreRing score={story.travelScore} factors={story.scoreFactors} />
        <AchievementsRow items={story.achievements} />
        <StoryShareCard story={story} />

        <View style={styles.vaultPrompt}>
          <Text style={styles.vaultTitle}>Save to Travel Vault</Text>
          <Text style={styles.vaultSub}>
            Keep this story, timeline, score, and memories to revisit anytime.
          </Text>
          <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
            <Ionicons name="bookmark" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>
              {story.savedToVault ? 'Saved · Update vault' : 'Save story'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <SaveToast visible={toast} />

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable style={styles.secondaryBottom} onPress={onVault}>
          <Text style={styles.secondaryBottomText}>Open Vault</Text>
        </Pressable>
        <Pressable style={styles.primaryBottom} onPress={onDone}>
          <Text style={styles.primaryBottomText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  fallback: { flex: 1, backgroundColor: CLOUD.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontWeight: '800', color: CLOUD.ink, fontSize: 15 },
  vaultPrompt: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  vaultTitle: { fontSize: 18, fontWeight: '800', color: CLOUD.ink },
  vaultSub: { color: CLOUD.muted, marginTop: 6, marginBottom: 14, lineHeight: 20 },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: CLOUD.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(247,249,252,0.96)',
    borderTopWidth: 1,
    borderTopColor: CLOUD.border,
  },
  secondaryBottom: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD.card,
  },
  secondaryBottomText: { color: CLOUD.ink, fontWeight: '700' },
  primaryBottom: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBottomText: { color: '#fff', fontWeight: '800' },
});
