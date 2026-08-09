import { CLOUD } from '@/constants/cloudTheme';
import { fetchJourneyStoriesRemote } from '@/services/journeyStoryApi';
import { useAuthStore } from '@/store/authStore';
import { useJourneyStoryStore } from '@/store/journeyStoryStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { useEffect } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TravelVaultScreen() {
  const insets = useSafeAreaInsets();
  const vault = useJourneyStoryStore((s) => s.vault);
  const hydrateVault = useJourneyStoryStore((s) => s.hydrateVault);
  const setCurrent = useJourneyStoryStore((s) => s.setCurrent);
  const removeFromVault = useJourneyStoryStore((s) => s.removeFromVault);
  const saveToVault = useJourneyStoryStore((s) => s.saveToVault);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    void hydrateVault().then(async () => {
      if (isAuthenticated && !isGuest) {
        const remote = await fetchJourneyStoriesRemote();
        for (const story of remote) {
          await saveToVault(story);
        }
      }
    });
  }, [hydrateVault, isAuthenticated, isGuest, saveToVault, userId]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF2FF', CLOUD.bg]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Travel Vault</Text>
          <Text style={styles.sub}>Your cinematic journey archive</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {vault.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="planet-outline" size={40} color={CLOUD.primary} />
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptyBody}>
              Finish navigation to a destination — your AI Journey Story is saved here automatically.
            </Text>
          </View>
        ) : (
          vault.map((story) => (
            <Pressable
              key={story.id}
              style={styles.card}
              onPress={() => {
                setCurrent(story);
                router.push('/(app)/journey-story' as Href);
              }}
            >
              <ImageBackground source={{ uri: story.destinationImage }} style={styles.cardImg}>
                <LinearGradient
                  colors={['transparent', 'rgba(15,23,42,0.85)']}
                  style={styles.cardOverlay}
                >
                  <Text style={styles.cardTitle}>{story.destinationName}</Text>
                  <Text style={styles.cardMeta}>
                    {story.completedAt} · Score {story.travelScore}
                  </Text>
                  <Text style={styles.cardStats}>
                    {story.statistics.distanceKm} km · ₹{story.statistics.totalBudgetInr}
                  </Text>
                </LinearGradient>
              </ImageBackground>
              <Pressable
                style={styles.remove}
                onPress={() => void removeFromVault(story.id)}
                hitSlop={8}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '900', color: CLOUD.ink },
  sub: { color: CLOUD.muted, marginTop: 2, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  empty: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: CLOUD.ink },
  emptyBody: { textAlign: 'center', color: CLOUD.muted, lineHeight: 20 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: CLOUD.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  cardImg: { height: 180 },
  cardOverlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  cardMeta: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  cardStats: { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontSize: 13 },
  remove: { padding: 12, alignItems: 'flex-end' },
  removeText: { color: CLOUD.danger, fontWeight: '700', fontSize: 13 },
});
