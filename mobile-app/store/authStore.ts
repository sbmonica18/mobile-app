import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/services/api';
import { fetchMe, login as loginRequest, register as registerRequest } from '@/services/authService';
import type { User } from '@/types/auth';
import { tokenStorage } from '@/utils/tokenStorage';
import { create } from 'zustand';

const GUEST_NAME_KEY = 'urbanlens.guestDisplayName.v1.guest';

type AuthState = {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  guestDisplayName: string;
  isHydrated: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  setGuestDisplayName: (name: string) => Promise<void>;
};

/** Swap vault / prefs to the account that is now active. */
async function reloadAccountLocalData() {
  const { useJourneyStoryStore } = await import('@/store/journeyStoryStore');
  const { useProfilePreferencesStore } = await import('@/store/profilePreferencesStore');
  useJourneyStoryStore.getState().resetForAccountChange();
  useProfilePreferencesStore.getState().resetForAccountChange();
  await Promise.all([
    useJourneyStoryStore.getState().hydrateVault(),
    useProfilePreferencesStore.getState().hydrate(),
  ]);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isGuest: false,
  guestDisplayName: 'Guest explorer',
  isHydrated: false,
  isAuthenticated: false,

  hydrate: async () => {
    const markReady = (partial: Partial<AuthState>) => {
      set({ ...partial, isHydrated: true });
    };

    try {
      const [token, userJson, legacyGuest] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser(),
        tokenStorage.isGuest(),
      ]);

      // Guest is session-only — never auto-restore after app restart.
      if (legacyGuest) {
        await tokenStorage.clearGuest();
      }

      if (token && userJson) {
        let user: User | null = null;
        try {
          user = JSON.parse(userJson) as User;
        } catch {
          user = null;
        }

        if (user) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
          markReady({
            token,
            user,
            isGuest: false,
            isAuthenticated: true,
          });
          await reloadAccountLocalData();

          void fetchMe()
            .then(async (me) => {
              await tokenStorage.saveUser(JSON.stringify(me));
              set({ user: me });
              const { useProfilePreferencesStore } = await import('@/store/profilePreferencesStore');
              useProfilePreferencesStore.getState().syncFromUser(me);
            })
            .catch(async (error) => {
              const status = (error as { status?: number })?.status;
              if (status === 401 || status === 403) {
                await tokenStorage.clearSession();
                delete apiClient.defaults.headers.common.Authorization;
                set({
                  user: null,
                  token: null,
                  isGuest: false,
                  isAuthenticated: false,
                });
                await reloadAccountLocalData();
              }
            });
          return;
        }
      }

      markReady({
        user: null,
        token: null,
        isGuest: false,
        isAuthenticated: false,
      });
      await reloadAccountLocalData();
    } catch {
      markReady({
        user: null,
        token: null,
        isGuest: false,
        isAuthenticated: false,
      });
      await reloadAccountLocalData();
    }
  },

  setSession: async (token, user) => {
    await tokenStorage.clearGuest();
    await tokenStorage.saveToken(token);
    await tokenStorage.saveUser(JSON.stringify(user));
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({
      token,
      user,
      isGuest: false,
      isAuthenticated: true,
    });
    await reloadAccountLocalData();
    const { useProfilePreferencesStore } = await import('@/store/profilePreferencesStore');
    useProfilePreferencesStore.getState().syncFromUser(user);
  },

  updateUser: async (user) => {
    await tokenStorage.saveUser(JSON.stringify(user));
    set({ user });
  },

  register: async (fullName, email, password) => {
    const data = await registerRequest({ fullName, email, password });
    await get().setSession(data.accessToken, data.user);
  },

  login: async (email, password) => {
    const data = await loginRequest({ email, password });
    await get().setSession(data.accessToken, data.user);
  },

  continueAsGuest: async () => {
    await tokenStorage.clearToken();
    await tokenStorage.clearUser();
    await tokenStorage.clearGuest();
    delete apiClient.defaults.headers.common.Authorization;
    let guestDisplayName = 'Guest explorer';
    try {
      const raw = await AsyncStorage.getItem(GUEST_NAME_KEY);
      if (raw?.trim()) guestDisplayName = raw.trim();
    } catch {
      // keep default
    }
    set({
      user: null,
      token: null,
      isGuest: true,
      isAuthenticated: true,
      guestDisplayName,
    });
    await reloadAccountLocalData();
  },

  setGuestDisplayName: async (name) => {
    const trimmed = name.trim();
    set({ guestDisplayName: trimmed || 'Guest explorer' });
    try {
      await AsyncStorage.setItem(GUEST_NAME_KEY, trimmed || 'Guest explorer');
    } catch {
      // ignore
    }
  },

  logout: async () => {
    await tokenStorage.clearSession();
    delete apiClient.defaults.headers.common.Authorization;
    set({
      user: null,
      token: null,
      isGuest: false,
      isAuthenticated: false,
    });
    const { useDashboardStore } = await import('@/store/dashboardStore');
    const { clearCachedUserLocation } = await import('@/services/locationService');
    useDashboardStore.getState().clearLocation();
    await clearCachedUserLocation();
    await reloadAccountLocalData();
  },
}));
