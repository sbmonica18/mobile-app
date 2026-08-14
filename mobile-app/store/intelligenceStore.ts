import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { runIntelligenceEngine } from '@/services/intelligence/intelligenceActions';
import type {
  IntelligenceEvent,
  IntelligenceImpact,
  IntelligenceSnapshot,
  WhatChangedSnapshot,
} from '@/services/intelligence/intelligenceTypes';
import type { WeatherInfo, UserLocation } from '@/types/places';

const PRIOR_KEY = 'urbanlens.intelligence.prior.v1';
const IMPACT_KEY = 'urbanlens.intelligence.impact.v1';
const ACCEPTED_KEY = 'urbanlens.intelligence.accepted.v1';

type IntelligenceState = {
  snapshot: IntelligenceSnapshot | null;
  loading: boolean;
  scanning: boolean;
  lastError: string | null;
  priorByDestination: Record<string, WhatChangedSnapshot>;
  sessionImpact: IntelligenceImpact | null;
  acceptedCount: number;
  companionEvents: IntelligenceEvent[];
  refresh: (args: {
    source: UserLocation | null;
    weather: WeatherInfo | null;
    destination?: {
      id: string;
      name: string;
      matchScore?: number;
      distanceKm?: number;
      travelTimeMin?: number;
      crowdLevel?: string;
      parkingAvailability?: string;
      rainProbability?: number;
      weatherLabel?: string;
      tempC?: number;
    } | null;
    prefs?: { budget?: string; mood?: string; availableHours?: number } | null;
    journeyActive?: boolean;
    withScan?: boolean;
  }) => Promise<IntelligenceSnapshot>;
  hydratePriors: () => Promise<void>;
  rememberDestinationSnapshot: (snap: WhatChangedSnapshot) => Promise<void>;
  acceptRecommendation: (eventId: string) => void;
  recordRouteAdjustment: () => void;
  clearSessionImpact: () => void;
  setCompanionFromSnapshot: (snap: IntelligenceSnapshot | null) => void;
};

export const useIntelligenceStore = create<IntelligenceState>((set, get) => ({
  snapshot: null,
  loading: false,
  scanning: false,
  lastError: null,
  priorByDestination: {},
  sessionImpact: null,
  acceptedCount: 0,
  companionEvents: [],

  hydratePriors: async () => {
    try {
      const raw = await AsyncStorage.getItem(PRIOR_KEY);
      const accepted = await AsyncStorage.getItem(ACCEPTED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, WhatChangedSnapshot>;
        set({ priorByDestination: parsed });
      }
      if (accepted) set({ acceptedCount: Number(accepted) || 0 });
    } catch {
      // ignore
    }
  },

  rememberDestinationSnapshot: async (snap) => {
    const next = { ...get().priorByDestination, [snap.destinationId]: snap };
    set({ priorByDestination: next });
    try {
      await AsyncStorage.setItem(PRIOR_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  },

  acceptRecommendation: (eventId) => {
    const acceptedCount = get().acceptedCount + 1;
    const impact = get().sessionImpact ?? get().snapshot?.impact;
    const nextImpact: IntelligenceImpact | null = impact
      ? {
          ...impact,
          recommendationsAccepted: (impact.recommendationsAccepted || 0) + 1,
        }
      : null;
    set({ acceptedCount, sessionImpact: nextImpact });
    void AsyncStorage.setItem(ACCEPTED_KEY, String(acceptedCount));
    void eventId;
  },

  recordRouteAdjustment: () => {
    const impact = get().sessionImpact ?? get().snapshot?.impact;
    if (!impact) return;
    set({
      sessionImpact: {
        ...impact,
        routesAdjusted: impact.routesAdjusted + 1,
        minutesSavedEst: impact.minutesSavedEst + 8,
        minutesAreEstimate: true,
        bullets: impact.bullets.includes('Adjusted route for conditions')
          ? impact.bullets
          : [...impact.bullets, 'Adjusted route for conditions'],
      },
    });
  },

  clearSessionImpact: () => set({ sessionImpact: null }),

  setCompanionFromSnapshot: (snap) => {
    if (!snap) {
      set({ companionEvents: [] });
      return;
    }
    set({
      companionEvents: snap.events.filter(
        (e) => e.priority === 'HIGH' || e.priority === 'MEDIUM' || e.type === 'WEATHER_CHANGE',
      ).slice(0, 4),
    });
  },

  refresh: async ({ source, weather, destination, prefs, journeyActive, withScan }) => {
    set({ loading: true, lastError: null, scanning: !!withScan });
    if (withScan) {
      await new Promise((r) => setTimeout(r, 900));
    }
    try {
      const prior = destination?.id ? get().priorByDestination[destination.id] : null;
      const snap = runIntelligenceEngine({
        latitude: source?.latitude,
        longitude: source?.longitude,
        areaLabel: source?.label || source?.address,
        weather: weather
          ? {
              temperatureC: weather.temperatureC,
              humidity: weather.humidity,
              windKph: weather.windKph,
              description: weather.description,
              code: weather.code,
              aqi: weather.aqi,
              uvIndex: weather.uvIndex,
              rainProbability: weather.rainProbability,
            }
          : null,
        destination: destination ?? null,
        priorSnapshot: prior ?? null,
        journeyActive,
        prefs: prefs ?? null,
      });

      const prevImpact = get().sessionImpact;
      const impact = snap.impact
        ? {
            ...snap.impact,
            recommendationsAccepted:
              prevImpact?.recommendationsAccepted ?? snap.impact.recommendationsAccepted,
            routesAdjusted: prevImpact?.routesAdjusted ?? snap.impact.routesAdjusted,
            minutesSavedEst: Math.max(
              prevImpact?.minutesSavedEst ?? 0,
              snap.impact.minutesSavedEst,
            ),
            bullets: Array.from(
              new Set([...(prevImpact?.bullets ?? []), ...snap.impact.bullets]),
            ).slice(0, 6),
          }
        : prevImpact;

      set({
        snapshot: { ...snap, impact: impact ?? snap.impact },
        sessionImpact: impact ?? snap.impact,
        loading: false,
        scanning: false,
        companionEvents: snap.events
          .filter((e) => e.type === 'WEATHER_CHANGE' || e.type === 'MOBILITY' || e.type === 'CROWD_SHIFT')
          .slice(0, 4),
      });

      if (snap.whatChanged) {
        void get().rememberDestinationSnapshot(snap.whatChanged);
      }

      try {
        await AsyncStorage.setItem(IMPACT_KEY, JSON.stringify(impact ?? snap.impact));
      } catch {
        // ignore
      }

      return get().snapshot!;
    } catch (error) {
      set({
        loading: false,
        scanning: false,
        lastError: error instanceof Error ? error.message : 'Intelligence unavailable',
      });
      throw error;
    }
  },
}));
