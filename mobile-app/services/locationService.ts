import type { PlaceResult, UserLocation, WeatherInfo } from '@/types/places';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LOCATION_CACHE_KEY = 'urbanlens.lastLocation.v1';

function withTimeout<T>(promise: Promise<T>, ms: number, label = 'Timed out'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function readCachedUserLocation(): Promise<UserLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserLocation;
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        label: parsed.label || 'Current location',
        address: parsed.address || parsed.label || 'Current location',
      };
    }
  } catch {
    // ignore bad cache
  }
  return null;
}

async function writeCachedUserLocation(location: UserLocation) {
  try {
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch {
    // ignore
  }
}

export async function clearCachedUserLocation() {
  try {
    await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
  } catch {
    // ignore
  }
}

export function describeLocationError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? Number((error as { code: number }).code) : NaN;
  if (code === 1) {
    return 'Allow location for UrbanLens in the browser or phone settings, then try again.';
  }
  if (code === 2) {
    return 'GPS is unavailable. Turn on Location / GPS and try again.';
  }
  if (code === 3) {
    return 'Location timed out. Move to an open area and try again.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Location is required. Turn on GPS and allow UrbanLens to use it.';
}

function getBrowserCoords(
  timeoutMs: number,
  options: { enableHighAccuracy: boolean; maximumAge: number },
): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('This browser cannot read GPS. Open UrbanLens on your phone or use Chrome/Safari.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: options.maximumAge,
      },
    );
  });
}

const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'UrbanLens/1.0 (final-year-project; contact@urbanlens.app)',
};

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
};

function weatherDescription(code: number) {
  return WEATHER_CODES[code] ?? 'Weather update';
}

export async function requestLocationPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const asked = await Location.requestForegroundPermissionsAsync();
  return asked.granted;
}

async function getFreshCoords(): Promise<{ latitude: number; longitude: number }> {
  if (Platform.OS === 'web') {
    try {
      return await getBrowserCoords(7000, { enableHighAccuracy: false, maximumAge: 60_000 });
    } catch {
      return getBrowserCoords(12000, { enableHighAccuracy: true, maximumAge: 0 });
    }
  }

  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location permission is required. Allow UrbanLens to use your location to continue.');
  }

  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last?.coords && Date.now() - last.timestamp < 120_000) {
      return { latitude: last.coords.latitude, longitude: last.coords.longitude };
    }
  } catch {
    // read a fresh position
  }

  const position = await withTimeout(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    12000,
    'GPS timed out. Turn on Location and try again.',
  );
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

/** Live GPS only. Returns as soon as coordinates exist — place name is filled in the background. */
export async function requireLiveUserLocation(): Promise<UserLocation> {
  const coords = await getFreshCoords();
  const location: UserLocation = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    label: 'Current location',
    address: 'Current location',
  };
  await writeCachedUserLocation(location);
  return location;
}

export async function getCurrentUserLocation(): Promise<UserLocation> {
  return requireLiveUserLocation();
}

/** Resolve suburb/city name after coords are already on screen. */
export async function refineUserLocationLabel(location: UserLocation): Promise<UserLocation> {
  try {
    const reverse = await withTimeout(reverseGeocode(location.latitude, location.longitude), 2500, 'Geocode timed out');
    const named: UserLocation = {
      ...location,
      label: reverse.placeName,
      address: reverse.address,
    };
    void writeCachedUserLocation(named);
    return named;
  } catch {
    return location;
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<PlaceResult> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!response.ok) {
    throw new Error('Could not resolve your current place name.');
  }
  const data = (await response.json()) as {
    display_name?: string;
    name?: string;
    address?: Record<string, string>;
  };

  const addressParts = data.address ?? {};
  const placeName =
    data.name ||
    addressParts.suburb ||
    addressParts.neighbourhood ||
    addressParts.city_district ||
    addressParts.city ||
    addressParts.town ||
    addressParts.village ||
    addressParts.state ||
    'Current location';

  return {
    placeKey: `${latitude.toFixed(5)},${longitude.toFixed(5)}`,
    placeName,
    address: data.display_name ?? placeName,
    latitude,
    longitude,
  };
}

type NominatimSearchItem = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
  };
};

function mapNominatimResults(data: NominatimSearchItem[], query?: string): PlaceResult[] {
  return data.map((item) => ({
    placeKey: String(item.place_id),
    placeName: item.name || item.display_name.split(',')[0],
    address: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    query,
  }));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000))} m away`;
  return `${km.toFixed(1)} km away`;
}

function categoryLabel(osmKey?: string, osmValue?: string) {
  if (!osmValue) return 'nearby';
  if (osmKey === 'railway') return 'station';
  return osmValue.replace(/_/g, ' ');
}

async function fetchPhotonCategory(
  latitude: number,
  longitude: number,
  q: string,
  osmTag?: string,
): Promise<Array<PlaceResult & { distanceKm: number }>> {
  const params = new URLSearchParams({
    q,
    lat: String(latitude),
    lon: String(longitude),
    limit: '10',
  });
  if (osmTag) params.append('osm_tag', osmTag);

  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': NOMINATIM_HEADERS['User-Agent'],
    },
  });
  if (!response.ok) return [];

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const maxKm = 10;
  const results: Array<PlaceResult & { distanceKm: number }> = [];

  for (const feature of data.features ?? []) {
    const name = feature.properties.name?.trim();
    const [lon, lat] = feature.geometry.coordinates;
    if (!name || lat == null || lon == null) continue;

    const distanceKm = haversineKm(latitude, longitude, lat, lon);
    if (distanceKm > maxKm) continue;

    const area =
      feature.properties.district ||
      feature.properties.city ||
      feature.properties.state ||
      '';
    const category = categoryLabel(feature.properties.osm_key, feature.properties.osm_value);

    results.push({
      placeKey: `photon-${feature.properties.osm_type ?? 'n'}-${feature.properties.osm_id ?? `${lat},${lon}`}`,
      placeName: name,
      address: `${category}${area ? ` · ${area}` : ''} · ${formatDistance(distanceKm)}`,
      latitude: lat,
      longitude: lon,
      query: category,
      distanceKm,
    });
  }

  return results;
}

async function fetchPhotonNearby(
  latitude: number,
  longitude: number,
  areaLabel?: string,
): Promise<PlaceResult[]> {
  const area = areaLabel?.trim() || '';
  const searches: Array<{ q: string; tag?: string }> = [
    { q: 'park', tag: 'leisure:park' },
    { q: 'temple', tag: 'amenity:place_of_worship' },
    { q: 'college', tag: 'amenity:college' },
    { q: 'university', tag: 'amenity:university' },
    { q: 'museum', tag: 'tourism:museum' },
    { q: 'attraction', tag: 'tourism:attraction' },
    { q: 'garden', tag: 'leisure:garden' },
    { q: 'cinema', tag: 'amenity:cinema' },
    { q: 'market', tag: 'amenity:marketplace' },
  ];

  if (area) {
    searches.unshift(
      { q: `${area} railway station`, tag: 'railway:station' },
      { q: `${area} park` },
      { q: `${area} temple` },
      { q: `${area} college` },
    );
  }

  const batches = await Promise.all(
    searches.map((item) =>
      fetchPhotonCategory(latitude, longitude, item.q, item.tag).catch(() => []),
    ),
  );

  const seen = new Set<string>();
  const merged: Array<PlaceResult & { distanceKm: number }> = [];

  for (const batch of batches) {
    for (const place of batch) {
      const key = place.placeName.toLowerCase();
      if (seen.has(key)) continue;
      if (key === 'park' || key === 'temple' || key === 'station' || key === 'mall') continue;
      seen.add(key);
      merged.push(place);
    }
  }

  merged.sort((a, b) => a.distanceKm - b.distanceKm);
  return merged.slice(0, 8).map(({ distanceKm: _, ...place }) => place);
}

export type NearbyCategoryKey = 'heritage' | 'museum' | 'park' | 'beach' | 'theatre';

export const NEARBY_CATEGORY_SEARCHES: Record<
  NearbyCategoryKey,
  Array<{ q: string; tag?: string; typeLabel: string }>
> = {
  heritage: [
    { q: 'temple', tag: 'amenity:place_of_worship', typeLabel: 'Temple' },
    { q: 'church', tag: 'amenity:place_of_worship', typeLabel: 'Church' },
    { q: 'mosque', tag: 'amenity:place_of_worship', typeLabel: 'Mosque' },
    { q: 'historic', tag: 'historic', typeLabel: 'Heritage' },
  ],
  museum: [{ q: 'museum', tag: 'tourism:museum', typeLabel: 'Museum' }],
  park: [
    { q: 'park', tag: 'leisure:park', typeLabel: 'Park' },
    { q: 'garden', tag: 'leisure:garden', typeLabel: 'Garden' },
  ],
  beach: [{ q: 'beach', tag: 'natural:beach', typeLabel: 'Beach' }],
  theatre: [
    { q: 'theatre', tag: 'amenity:theatre', typeLabel: 'Theatre' },
    { q: 'cinema', tag: 'amenity:cinema', typeLabel: 'Cinema' },
  ],
};

function inferTypeLabel(name: string, address: string, fallback: string): string {
  const text = `${name} ${address}`.toLowerCase();
  if (/temple|kovil|mandir/.test(text)) return 'Temple';
  if (/church|cathedral|chapel/.test(text)) return 'Church';
  if (/mosque|masjid/.test(text)) return 'Mosque';
  if (/museum/.test(text)) return 'Museum';
  if (/park|garden/.test(text)) return 'Park';
  if (/beach|shore/.test(text)) return 'Beach';
  if (/theatre|theater|auditorium/.test(text)) return 'Theatre';
  if (/cinema|movie/.test(text)) return 'Cinema';
  return fallback;
}

/** Category-focused nearby search for Explore chips (Heritage, Museum, …). */
export async function searchNearbyByCategory(
  latitude: number,
  longitude: number,
  category: NearbyCategoryKey,
  cityLabel?: string,
): Promise<PlaceResult[]> {
  const area = cityLabel?.trim() || '';
  const specs = NEARBY_CATEGORY_SEARCHES[category];
  const searches = specs.flatMap((spec) => {
    const list = [{ q: spec.q, tag: spec.tag, typeLabel: spec.typeLabel }];
    if (area) list.push({ q: `${area} ${spec.q}`, tag: spec.tag, typeLabel: spec.typeLabel });
    return list;
  });

  const batches = await Promise.all(
    searches.map(async (item) => {
      const places = await fetchPhotonCategory(latitude, longitude, item.q, item.tag).catch(
        () => [],
      );
      return places.map((place) => ({
        ...place,
        query: inferTypeLabel(place.placeName, place.address, item.typeLabel),
      }));
    }),
  );

  const seen = new Set<string>();
  const merged: Array<PlaceResult & { distanceKm: number }> = [];
  for (const batch of batches) {
    for (const place of batch) {
      const key = place.placeName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(place);
    }
  }

  merged.sort((a, b) => a.distanceKm - b.distanceKm);
  return merged.slice(0, 12).map(({ distanceKm: _, ...place }) => place);
}

async function fetchNominatimNearbyFallback(
  latitude: number,
  longitude: number,
  cityLabel?: string,
): Promise<PlaceResult[]> {
  const city = cityLabel?.trim() || 'nearby';
  const queries = [
    `${city} railway station`,
    `${city} park`,
    `${city} temple`,
    `${city} college`,
    `park near ${city}`,
    `temple near ${city}`,
  ];

  const seen = new Set<string>();
  const results: Array<PlaceResult & { distanceKm: number }> = [];

  for (const q of queries) {
    if (results.length >= 8) break;
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
      const response = await fetch(url, { headers: NOMINATIM_HEADERS });
      if (!response.ok) continue;
      const data = (await response.json()) as NominatimSearchItem[];
      for (const item of mapNominatimResults(data, city)) {
        const key = item.placeName.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        const distanceKm = haversineKm(latitude, longitude, item.latitude, item.longitude);
        if (distanceKm > 12) continue;
        seen.add(key);
        results.push({
          ...item,
          address: `${formatDistance(distanceKm)} · near ${city}`,
          distanceKm,
        });
      }
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      // try next
    }
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results.slice(0, 8).map(({ distanceKm: _, ...place }) => place);
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!response.ok) {
    throw new Error('Place search failed. Try again.');
  }

  const data = (await response.json()) as NominatimSearchItem[];
  return mapNominatimResults(data, trimmed);
}

/**
 * Real nearby places for the source location (parks, temples, colleges, attractions).
 * Uses Photon (location-biased OSM) first, then Nominatim fallback.
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  cityLabel?: string,
): Promise<PlaceResult[]> {
  const photon = await fetchPhotonNearby(latitude, longitude, cityLabel);
  if (photon.length >= 4) {
    return photon;
  }

  const fallback = await fetchNominatimNearbyFallback(latitude, longitude, cityLabel);
  const seen = new Set(photon.map((p) => p.placeName.toLowerCase()));
  const merged = [...photon];
  for (const place of fallback) {
    const key = place.placeName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
    if (merged.length >= 8) break;
  }
  return merged;
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherInfo> {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,surface_pressure` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,uv_index` +
    `&daily=sunrise,sunset&forecast_days=1&wind_speed_unit=kmh&timezone=auto`;
  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
    `&current=us_aqi`;

  const [forecastRes, aqiRes] = await Promise.all([
    fetch(forecastUrl),
    fetch(aqiUrl).catch(() => null),
  ]);
  if (!forecastRes.ok) {
    throw new Error('Weather service is unavailable right now.');
  }
  const data = (await forecastRes.json()) as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      weather_code: number;
      wind_speed_10m: number;
      apparent_temperature?: number;
      surface_pressure?: number;
    };
    hourly?: {
      time: string[];
      temperature_2m?: (number | null)[];
      weather_code?: (number | null)[];
      precipitation_probability?: (number | null)[];
      uv_index?: (number | null)[];
    };
    daily?: {
      sunrise?: string[];
      sunset?: string[];
    };
  };

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const localHourKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}`;
  let idx = 0;
  if (data.hourly?.time?.length) {
    const found = data.hourly.time.findIndex((t) => t.startsWith(localHourKey));
    idx = found >= 0 ? found : Math.min(now.getHours(), data.hourly.time.length - 1);
  }

  let rainProbability: number | undefined;
  let uvIndex: number | undefined;
  if (data.hourly?.time?.length) {
    const rain = data.hourly.precipitation_probability?.[idx];
    const uv = data.hourly.uv_index?.[idx];
    if (typeof rain === 'number') rainProbability = Math.round(rain);
    if (typeof uv === 'number') uvIndex = Math.round(uv);
  }

  const hourly: WeatherInfo['hourly'] = [];
  if (data.hourly?.time?.length && data.hourly.temperature_2m?.length) {
    for (let i = idx; i < Math.min(idx + 12, data.hourly.time.length); i++) {
      const temp = data.hourly.temperature_2m[i];
      const code = data.hourly.weather_code?.[i];
      if (typeof temp !== 'number') continue;
      const timeStr = data.hourly.time[i];
      const hour = Number(timeStr.slice(11, 13));
      const label =
        i === idx ? 'NOW' : `${((hour + 11) % 12) + 1} ${hour >= 12 ? 'PM' : 'AM'}`;
      const wCode = typeof code === 'number' ? code : data.current.weather_code;
      hourly.push({
        label,
        temperatureC: Math.round(temp),
        code: wCode,
        description: weatherDescription(wCode),
      });
    }
  }

  function formatSun(iso?: string) {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  let aqi: number | undefined;
  if (aqiRes?.ok) {
    try {
      const aqiData = (await aqiRes.json()) as { current?: { us_aqi?: number | null } };
      if (typeof aqiData.current?.us_aqi === 'number') {
        aqi = Math.round(aqiData.current.us_aqi);
      }
    } catch {
      // AQI is optional enrichment — weather still returns without it.
    }
  }

  return {
    temperatureC: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    windKph: Math.round(data.current.wind_speed_10m),
    code: data.current.weather_code,
    description: weatherDescription(data.current.weather_code),
    aqi,
    uvIndex,
    rainProbability,
    feelsLikeC:
      typeof data.current.apparent_temperature === 'number'
        ? Math.round(data.current.apparent_temperature)
        : undefined,
    pressureHpa:
      typeof data.current.surface_pressure === 'number'
        ? Math.round(data.current.surface_pressure)
        : undefined,
    sunrise: formatSun(data.daily?.sunrise?.[0]),
    sunset: formatSun(data.daily?.sunset?.[0]),
    hourly: hourly.length ? hourly : undefined,
  };
}
