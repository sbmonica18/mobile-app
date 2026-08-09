import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { getAccountScopeId, scopedStorageKey } from '@/utils/accountScope';
import { tokenStorage } from '@/utils/tokenStorage';
import { create } from 'zustand';

const PREFS_BASE = 'urbanlens.profilePreferences.v2';
const SEEN_ACHIEVEMENTS_BASE = 'urbanlens.seenAchievements.v2';

export type ProfilePreferences = {
  travelStyle: string | null;
  transportMode: string | null;
  budgetTier: string | null;
};

type PrefsState = {
  preferences: ProfilePreferences;
  hydrated: boolean;
  newlyUnlockedIds: string[];
  scopeId: string | null;
  hydrate: () => Promise<void>;
  resetForAccountChange: () => void;
  setPreference: <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => Promise<void>;
  syncFromUser: (user: {
    preferredTravelStyle?: string | null;
    preferredTransportMode?: string | null;
    preferredBudgetTier?: string | null;
  } | null) => void;
  markAchievementsSeen: (ids: string[]) => Promise<string[]>;
  clearNewlyUnlocked: () => void;
};

const empty: ProfilePreferences = {
  travelStyle: null,
  transportMode: null,
  budgetTier: null,
};

async function persistLocal(scopeId: string, prefs: ProfilePreferences) {
  try {
    await AsyncStorage.setItem(scopedStorageKey(PREFS_BASE, scopeId), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export const useProfilePreferencesStore = create<PrefsState>((set, get) => ({
  preferences: empty,
  hydrated: false,
  newlyUnlockedIds: [],
  scopeId: null,

  resetForAccountChange: () => {
    set({
      preferences: empty,
      hydrated: false,
      newlyUnlockedIds: [],
      scopeId: null,
    });
  },

  hydrate: async () => {
    const scopeId = getAccountScopeId();
    try {
      const raw = await AsyncStorage.getItem(scopedStorageKey(PREFS_BASE, scopeId));
      if (raw) {
        const parsed = JSON.parse(raw) as ProfilePreferences;
        set({ preferences: { ...empty, ...parsed }, hydrated: true, scopeId });
      } else {
        set({ preferences: empty, hydrated: true, scopeId });
      }
    } catch {
      set({ preferences: empty, hydrated: true, scopeId });
    }
  },

  syncFromUser: (user) => {
    if (!user) return;
    const scopeId = getAccountScopeId();
    const next: ProfilePreferences = {
      travelStyle: user.preferredTravelStyle ?? null,
      transportMode: user.preferredTransportMode ?? null,
      budgetTier: user.preferredBudgetTier ?? null,
    };
    set({ preferences: next, scopeId });
    void persistLocal(scopeId, next);
  },

  setPreference: async (key, value) => {
    const scopeId = getAccountScopeId();
    const preferences = { ...get().preferences, [key]: value };
    set({ preferences, scopeId });
    await persistLocal(scopeId, preferences);

    const { isGuest, isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated || isGuest || !user) return;

    try {
      const payload =
        key === 'travelStyle'
          ? { preferredTravelStyle: value }
          : key === 'transportMode'
            ? { preferredTransportMode: value }
            : { preferredBudgetTier: value };
      const updated = await updateProfile(payload);
      await tokenStorage.saveUser(JSON.stringify(updated));
      useAuthStore.setState({ user: updated });
    } catch {
      // local prefs still saved
    }
  },

  markAchievementsSeen: async (unlockedIds) => {
    const scopeId = getAccountScopeId();
    try {
      const key = scopedStorageKey(SEEN_ACHIEVEMENTS_BASE, scopeId);
      const raw = await AsyncStorage.getItem(key);
      const seen: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const newly = unlockedIds.filter((id) => !seen.includes(id));
      const nextSeen = Array.from(new Set([...seen, ...unlockedIds]));
      await AsyncStorage.setItem(key, JSON.stringify(nextSeen));
      set({ newlyUnlockedIds: newly, scopeId });
      return newly;
    } catch {
      set({ newlyUnlockedIds: [] });
      return [];
    }
  },

  clearNewlyUnlocked: () => set({ newlyUnlockedIds: [] }),
}));
