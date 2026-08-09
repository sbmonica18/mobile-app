import * as Location from 'expo-location';

import type { PlaceResult, UserLocation, WeatherInfo } from '@/types/places';

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

import { Platform } from 'react-native';

export async function getCurrentUserLocation(): Promise<UserLocation> {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location permission is required to detect weather and your source place.');
  }

  let position;
  try {
    if (Platform.OS === 'web') {
      // Use getLastKnownPositionAsync on web to avoid the 6000ms timeout bug
      position = await Location.getLastKnownPositionAsync();
      if (!position) {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
      }
    } else {
      position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    }
  } catch (error) {
    console.log('Location error:', error);
    // Provide a default fallback if location completely fails
    return {
      latitude: 12.8465,
      longitude: 80.2263,
      label: 'Navalur',
      address: 'Navalur, Chennai',
    };
  }

  if (!position) {
    return {
      latitude: 12.8465,
      longitude: 80.2263,
      label: 'Navalur',
      address: 'Navalur, Chennai',
    };
  }

  const { latitude, longitude } = position.coords;
  const reverse = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    label: reverse.placeName,
    address: reverse.address,
  };
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
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&hourly=precipitation_probability,uv_index&forecast_days=1&wind_speed_unit=kmh&timezone=auto`;
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
    };
    hourly?: {
      time: string[];
      precipitation_probability?: (number | null)[];
      uv_index?: (number | null)[];
    };
  };

  let rainProbability: number | undefined;
  let uvIndex: number | undefined;
  if (data.hourly?.time?.length) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const localHourKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}`;
    let idx = data.hourly.time.findIndex((t) => t.startsWith(localHourKey));
    if (idx < 0) idx = Math.min(now.getHours(), data.hourly.time.length - 1);
    const rain = data.hourly.precipitation_probability?.[idx];
    const uv = data.hourly.uv_index?.[idx];
    if (typeof rain === 'number') rainProbability = Math.round(rain);
    if (typeof uv === 'number') uvIndex = Math.round(uv);
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
  };
}
