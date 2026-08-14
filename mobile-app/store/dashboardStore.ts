import {
  addRecentSearch,
  getRecentSearches,
  getSavedDestinations,
  removeSavedDestination,
  saveDestination,
} from '@/services/placesApi';
import type { DrivingRoute } from '@/services/routeService';
import type { PlaceItem, PlaceResult, UserLocation, WeatherInfo } from '@/types/places';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const PREFS_KEY = 'urbanlens.preferences.v1';

type DashboardState = {
  source: UserLocation | null;
  destination: PlaceResult | null;
  weather: WeatherInfo | null;
  recent: PlaceItem[];
  saved: PlaceItem[];
  locationLoading: boolean;
  weatherLoading: boolean;
  locationError: string | null;
  hasLiveFix: boolean;
  preferences: Record<string, number>;
  activeRoutes: DrivingRoute[];
  selectedRouteId: string | null;
  setSource: (source: UserLocation | null) => void;
  setDestination: (destination: PlaceResult | null) => void;
  setWeather: (weather: WeatherInfo | null) => void;
  setLocationLoading: (value: boolean) => void;
  setWeatherLoading: (value: boolean) => void;
  setLocationError: (value: string | null) => void;
  setLiveSource: (source: UserLocation) => void;
  clearLocation: () => void;
  loadLists: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  recordSearch: (place: PlaceResult) => Promise<void>;
  toggleSave: (place: PlaceResult) => Promise<void>;
  unsave: (item: PlaceItem) => Promise<void>;
  isSaved: (placeKey: string) => boolean;
  recordPreference: (category: string) => void;
  topPreferencePurpose: () => string;
  setActiveRoutes: (routes: DrivingRoute[]) => void;
  setSelectedRouteId: (id: string | null) => void;
  clearJourneySession: () => void;
};

async function persistPreferences(preferences: Record<string, number>) {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  } catch {
    // ignore storage failures
  }
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  source: null,
  destination: null,
  weather: null,
  recent: [],
  saved: [],
  locationLoading: false,
  weatherLoading: false,
  locationError: null,
  hasLiveFix: false,
  preferences: {},
  activeRoutes: [],
  selectedRouteId: null,

  setSource: (source) => set({ source }),
  setLiveSource: (source) => set({ source, hasLiveFix: true, locationError: null, locationLoading: false }),
  clearLocation: () =>
    set({
      source: null,
      weather: null,
      hasLiveFix: false,
      locationError: null,
      locationLoading: false,
    }),
  setDestination: (destination) => set({ destination }),
  setWeather: (weather) => set({ weather }),
  setLocationLoading: (locationLoading) => set({ locationLoading }),
  setWeatherLoading: (weatherLoading) => set({ weatherLoading }),
  setLocationError: (locationError) => set({ locationError }),
  setActiveRoutes: (activeRoutes) => set({ activeRoutes }),
  setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),

  clearJourneySession: () =>
    set({
      activeRoutes: [],
      selectedRouteId: null,
    }),

  loadLists: async () => {
    try {
      const [recent, saved] = await Promise.all([getRecentSearches(), getSavedDestinations()]);
      set({ recent, saved });
    } catch {
      // Keep existing lists if offline / API unavailable
    }
  },

  loadPreferences: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (parsed && typeof parsed === 'object') {
        set({ preferences: parsed });
      }
    } catch {
      // ignore
    }
  },

  recordSearch: async (place) => {
    set({ destination: place });
    try {
      const recent = await addRecentSearch(place);
      set({ recent });
    } catch {
      // Destination already set; recent sync can fail quietly
    }
  },

  toggleSave: async (place) => {
    try {
      const existing = get().saved.find((item) => item.placeKey === place.placeKey);
      if (existing) {
        const saved = await removeSavedDestination(existing.id, existing.placeKey);
        set({ saved });
        return;
      }
      const saved = await saveDestination(place);
      set({ saved });
    } catch {
      // Ignore save sync failures
    }
  },

  unsave: async (item) => {
    try {
      const saved = await removeSavedDestination(item.id, item.placeKey);
      set({ saved });
    } catch {
      // Ignore unsave sync failures
    }
  },

  isSaved: (placeKey) => get().saved.some((item) => item.placeKey === placeKey),

  recordPreference: (category: string) => {
    const key = category.trim().toLowerCase();
    if (!key) return;
    const preferences = {
      ...get().preferences,
      [key]: (get().preferences[key] || 0) + 1,
    };
    set({ preferences });
    void persistPreferences(preferences);
  },

  topPreferencePurpose: () => {
    const entries = Object.entries(get().preferences).sort((a, b) => b[1] - a[1]);
    return entries
      .slice(0, 2)
      .map(([k]) => k)
      .join(', ');
  },
}));
