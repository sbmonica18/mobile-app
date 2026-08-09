import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient, isAuthFailure } from '@/services/api';
import type { PlaceItem, PlaceResult } from '@/types/places';
import { useAuthStore } from '@/store/authStore';

const RECENT_KEY = 'urbanlens_recent_searches';
const SAVED_KEY = 'urbanlens_saved_destinations';

type ApiPlace = {
  id: number;
  placeKey?: string | null;
  placeName: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timestamp?: string;
};

function mapApiPlace(item: ApiPlace): PlaceItem {
  return {
    id: String(item.id),
    placeKey: item.placeKey ?? `${item.latitude},${item.longitude}`,
    placeName: item.placeName,
    address: item.address ?? item.placeName,
    latitude: item.latitude ?? 0,
    longitude: item.longitude ?? 0,
    timestamp: item.timestamp,
  };
}

function toPayload(place: PlaceResult) {
  return {
    query: place.query ?? place.placeName,
    placeName: place.placeName,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    placeKey: place.placeKey,
  };
}

/** Same city/place should appear only once in recent searches. */
export function placeIdentity(place: { placeKey?: string; placeName: string }) {
  const name = place.placeName.split(',')[0]?.trim().toLowerCase() || '';
  return name || (place.placeKey ?? '').toLowerCase();
}

export function dedupePlaces<T extends { placeKey?: string; placeName: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = placeIdentity(item);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result;
}

async function readLocal(key: string): Promise<PlaceItem[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as PlaceItem[];
  } catch {
    return [];
  }
}

async function writeLocal(key: string, items: PlaceItem[]) {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

function isLoggedIn() {
  const { token, isGuest } = useAuthStore.getState();
  return Boolean(token) && !isGuest;
}

/** Stale JWT (e.g. after H2 restart) → stop calling protected APIs this session. */
function handleAuthFailure(error: unknown) {
  if (!isAuthFailure(error)) return;
  delete apiClient.defaults.headers.common.Authorization;
  useAuthStore.setState({ token: null });
}

export async function getRecentSearches(): Promise<PlaceItem[]> {
  if (isLoggedIn()) {
    try {
      const { data } = await apiClient.get<ApiPlace[]>('/searches');
      return dedupePlaces(data.map(mapApiPlace));
    } catch (error) {
      handleAuthFailure(error);
      // fall through to local
    }
  }
  return dedupePlaces(await readLocal(RECENT_KEY));
}

export async function addRecentSearch(place: PlaceResult): Promise<PlaceItem[]> {
  if (isLoggedIn()) {
    try {
      await apiClient.post('/searches', toPayload(place));
      return getRecentSearches();
    } catch (error) {
      handleAuthFailure(error);
      // fall through to local
    }
  }

  const existing = await readLocal(RECENT_KEY);
  const identity = placeIdentity(place);
  const next: PlaceItem[] = dedupePlaces([
    {
      ...place,
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
    ...existing.filter((item) => placeIdentity(item) !== identity),
  ]).slice(0, 12);

  await writeLocal(RECENT_KEY, next);
  return next;
}

export async function getSavedDestinations(): Promise<PlaceItem[]> {
  if (isLoggedIn()) {
    try {
      const { data } = await apiClient.get<ApiPlace[]>('/saved-destinations');
      return data.map(mapApiPlace);
    } catch (error) {
      handleAuthFailure(error);
    }
  }
  return readLocal(SAVED_KEY);
}

export async function saveDestination(place: PlaceResult): Promise<PlaceItem[]> {
  if (isLoggedIn()) {
    try {
      await apiClient.post('/saved-destinations', toPayload(place));
      return getSavedDestinations();
    } catch (error) {
      handleAuthFailure(error);
    }
  }

  const existing = await readLocal(SAVED_KEY);
  if (existing.some((item) => placeIdentity(item) === placeIdentity(place))) {
    return existing;
  }
  const next: PlaceItem[] = [
    {
      ...place,
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
    ...existing,
  ];
  await writeLocal(SAVED_KEY, next);
  return next;
}

export async function removeSavedDestination(id: string, placeKey?: string): Promise<PlaceItem[]> {
  if (isLoggedIn()) {
    try {
      await apiClient.delete(`/saved-destinations/${id}`);
      return getSavedDestinations();
    } catch (error) {
      handleAuthFailure(error);
    }
  }

  const existing = await readLocal(SAVED_KEY);
  const next = existing.filter((item) => item.id !== id && item.placeKey !== placeKey);
  await writeLocal(SAVED_KEY, next);
  return next;
}
