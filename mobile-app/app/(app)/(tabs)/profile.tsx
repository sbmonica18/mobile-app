import { HomeShell } from '@/components/HomeDashboard';
import { AppearancePicker } from '@/components/AppearancePicker';
import { AnimatedCounter } from '@/components/journey-story/JourneyStoryKit';
import { CLOUD, layoutPad } from '@/constants/cloudTheme';
import { updateProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useJourneyStoryStore } from '@/store/journeyStoryStore';
import { useProfilePreferencesStore } from '@/store/profilePreferencesStore';
import { useThemeStore } from '@/store/themeStore';
import { computeAchievements, computeTravelStats } from '@/utils/profileStats';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function AchievementBadge({
  title,
  subtitle,
  icon,
  unlocked,
  conditionLabel,
  celebrate,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
  conditionLabel: string;
  celebrate: boolean;
}) {
  const reduce = !!useReducedMotion();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!celebrate || reduce) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 500, easing: Easing.inOut(Easing.quad) }),
      ),
      4,
      false,
    );
  }, [celebrate, glow, reduce]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: unlocked ? 0.12 + glow.value * 0.35 : 0,
    transform: [{ scale: 1 + glow.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.badgeCard, !unlocked && styles.badgeLocked, glowStyle]}>
      <View style={[styles.badgeIcon, unlocked ? styles.badgeIconOn : styles.badgeIconOff]}>
        <Ionicons name={icon} size={22} color={unlocked ? CLOUD.primary : CLOUD.muted} />
      </View>
      <Text style={[styles.badgeTitle, !unlocked && styles.badgeMuted]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.badgeSub, !unlocked && styles.badgeMuted]} numberOfLines={2}>
        {unlocked ? subtitle : conditionLabel}
      </Text>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  const vault = useJourneyStoryStore((s) => s.vault);
  const hydrateVault = useJourneyStoryStore((s) => s.hydrateVault);
  const vaultHydrated = useJourneyStoryStore((s) => s.hydrated);

  const hydratePrefs = useProfilePreferencesStore((s) => s.hydrate);
  const syncFromUser = useProfilePreferencesStore((s) => s.syncFromUser);
  const markAchievementsSeen = useProfilePreferencesStore((s) => s.markAchievementsSeen);
  const newlyUnlockedIds = useProfilePreferencesStore((s) => s.newlyUnlockedIds);
  const clearNewlyUnlocked = useProfilePreferencesStore((s) => s.clearNewlyUnlocked);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const colors = useThemeStore((s) => s.colors);
  const { width } = useWindowDimensions();
  const pad = layoutPad(width);

  useFocusEffect(
    useCallback(() => {
      if (isGuest) return;
      void hydrateVault();
      void hydratePrefs();
      if (user) syncFromUser(user);
      return () => clearNewlyUnlocked();
    }, [hydrateVault, hydratePrefs, user, isGuest, syncFromUser, clearNewlyUnlocked]),
  );

  const stats = useMemo(() => computeTravelStats(vault), [vault]);
  const achievements = useMemo(() => computeAchievements(stats), [stats]);

  useEffect(() => {
    if (isGuest || !vaultHydrated) return;
    const unlocked = achievements.filter((a) => a.unlocked).map((a) => a.id);
    void markAchievementsSeen(unlocked);
  }, [vaultHydrated, achievements, markAchievementsSeen, isGuest]);

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const goAuth = () => {
    router.push('/(auth)/login');
  };

  const openEdit = () => {
    if (isGuest || !user) {
      goAuth();
      return;
    }
    setEditName(user.fullName || '');
    setEditError(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const name = editName.trim();
    if (name.length < 2) {
      setEditError('Name must be at least 2 characters');
      return;
    }
    if (!user) {
      setEditError('Please sign in to edit your profile.');
      return;
    }

    setSaving(true);
    setEditError(null);

    // Always update locally first so rename feels instant and reliable
    await updateUser({ ...user, fullName: name });
    setEditOpen(false);
    setSaving(false);

    try {
      const updated = await updateProfile({ fullName: name });
      await updateUser({ ...user, ...updated, fullName: updated.fullName || name });
    } catch {
      // Local name is already saved on device; sync can retry next launch via /me
    }
  };

  const initials = (user?.fullName?.charAt(0) || 'U').toUpperCase();

  // Guest: only sign-in prompt — no stats / achievements / vault details
  if (isGuest) {
    return (
      <HomeShell>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.ink }]}>Profile</Text>
            <Animated.View entering={FadeInDown.duration(360)} style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>G</Text>
              </View>
              <Text style={[styles.name, { color: colors.ink }]}>Guest explorer</Text>
              <Text style={[styles.email, { color: colors.muted }]}>
                Sign in or create an account to see your profile details, travel stats,
                achievements, and quick links.
              </Text>
              <Pressable style={styles.guestCta} onPress={goAuth}>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.guestCtaText}>Sign in / Create account</Text>
              </Pressable>
              <Pressable onPress={onLogout} style={styles.guestExit}>
                <Text style={styles.guestExitText}>Exit guest mode</Text>
              </Pressable>
            </Animated.View>
            <AppearancePicker />
          </ScrollView>
        </SafeAreaView>
      </HomeShell>
    );
  }

  return (
    <HomeShell>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.ink }]}>Profile</Text>

          <Animated.View entering={FadeInDown.duration(360)} style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable onPress={openEdit} style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </View>
            </Pressable>
            <Text style={[styles.name, { color: colors.ink }]}>{user?.fullName || 'Traveler'}</Text>
            <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
            <Pressable onPress={openEdit} hitSlop={8}>
              <Text style={styles.editLink}>Edit profile</Text>
            </Pressable>
          </Animated.View>

          <AppearancePicker />

          <Animated.View entering={FadeInUp.delay(80).duration(360)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Travel Stats</Text>
            <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statCell}>
                <AnimatedCounter value={stats.tripsCompleted} />
                <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statCell}>
                <AnimatedCounter value={stats.totalDistanceKm} suffix=" km" />
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statCell}>
                <AnimatedCounter value={stats.placesVisited} />
                <Text style={styles.statLabel}>Places</Text>
              </View>
              <View style={styles.statCell}>
                <AnimatedCounter value={stats.totalSpentInr} prefix="₹" />
                <Text style={styles.statLabel}>Spent</Text>
              </View>
            </View>

            {stats.placeNames.length > 0 ? (
              <View style={styles.placesBlock}>
                <Text style={styles.placesHeading}>Places visited</Text>
                <View style={styles.placeChips}>
                  {stats.placeNames.map((place) => (
                    <View key={place} style={styles.placeChip}>
                      <Ionicons name="location-outline" size={14} color={CLOUD.primary} />
                      <Text style={styles.placeChipText}>{place}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyHint}>Complete a journey to start building real stats.</Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(140).duration(360)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Achievements</Text>
            <View style={styles.badgeGrid}>
              {achievements.map((a) => (
                <AchievementBadge
                  key={a.id}
                  title={a.title}
                  subtitle={a.subtitle}
                  icon={a.icon}
                  unlocked={a.unlocked}
                  conditionLabel={a.conditionLabel}
                  celebrate={newlyUnlockedIds.includes(a.id)}
                />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(360)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Quick Links</Text>
            <Pressable style={[styles.linkRow, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(app)/(tabs)/saved')}>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
              <Text style={[styles.linkText, { color: colors.ink }]}>Saved destinations</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
            <Pressable style={[styles.linkRow, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(app)/travel-vault')}>
              <Ionicons name="albums-outline" size={20} color={colors.primary} />
              <Text style={[styles.linkText, { color: colors.ink }]}>Travel Vault</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </Animated.View>

          <Pressable onPress={onLogout} style={[styles.logout, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.logoutText, { color: colors.ink }]}>Log out</Text>
          </Pressable>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && setEditOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.ink }]}>Edit profile</Text>
            <Text style={[styles.prefLabel, { color: colors.ink }]}>Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.input, { color: colors.ink, borderColor: colors.border, backgroundColor: colors.soft }]}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              autoFocus
              editable={!saving}
            />
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={saveEdit}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </HomeShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingTop: 12, paddingBottom: 16 },
  title: { color: CLOUD.ink, fontSize: 28, fontWeight: '800', marginBottom: 16 },
  headerCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radius,
    padding: 20,
    borderWidth: 1,
    borderColor: CLOUD.border,
    alignItems: 'center',
    ...CLOUD.shadow,
  },
  guestCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radius,
    padding: 24,
    borderWidth: 1,
    borderColor: CLOUD.border,
    alignItems: 'center',
    ...CLOUD.shadow,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CLOUD.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { color: CLOUD.ink, fontSize: 22, fontWeight: '700' },
  email: {
    color: CLOUD.muted,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  editLink: { color: CLOUD.primary, fontWeight: '700', marginTop: 10, fontSize: 14 },
  guestCta: {
    marginTop: 18,
    backgroundColor: CLOUD.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  guestCtaText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  guestExit: { marginTop: 14, paddingVertical: 8 },
  guestExitText: { color: CLOUD.muted, fontWeight: '700', fontSize: 14 },
  section: { marginTop: 24 },
  sectionTitle: { color: CLOUD.ink, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: CLOUD.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CLOUD.border,
    paddingVertical: 16,
    ...CLOUD.shadow,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { color: CLOUD.muted, fontSize: 11, fontWeight: '600', marginTop: 4 },
  placesBlock: { marginTop: 14 },
  placesHeading: {
    color: CLOUD.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLOUD.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  placeChipText: { color: CLOUD.ink, fontSize: 13, fontWeight: '600' },
  emptyHint: { color: CLOUD.muted, fontSize: 13, marginTop: 10 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    width: '47%',
    backgroundColor: CLOUD.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: CLOUD.border,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  badgeLocked: { opacity: 0.55 },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeIconOn: { backgroundColor: CLOUD.primary + '18' },
  badgeIconOff: { backgroundColor: '#F1F5F9' },
  badgeTitle: { color: CLOUD.ink, fontWeight: '800', fontSize: 14 },
  badgeSub: { color: CLOUD.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },
  badgeMuted: { color: CLOUD.muted },
  prefLabel: { color: CLOUD.ink, fontWeight: '700', fontSize: 13, marginBottom: 8, marginTop: 8 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CLOUD.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CLOUD.border,
    marginBottom: 10,
  },
  linkText: { flex: 1, color: CLOUD.ink, fontWeight: '700', fontSize: 15 },
  logout: {
    marginTop: 20,
    backgroundColor: CLOUD.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  logoutText: { color: CLOUD.ink, fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: CLOUD.ink, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: CLOUD.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: CLOUD.ink,
    backgroundColor: '#F8FAFC',
  },
  errorText: { color: '#DC2626', marginTop: 8, fontSize: 13 },
  saveBtn: {
    marginTop: 16,
    backgroundColor: CLOUD.ink,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
