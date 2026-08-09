import { haversineKm, type LatLng } from '@/services/routeService';

export type NearbyAttraction = {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  image?: string;
  latitude: number;
  longitude: number;
};

export type NearbyService = {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function elementCoords(el: OverpassElement): LatLng | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { latitude: lat, longitude: lon };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Deterministic fallback coords near a destination when Overpass is unavailable. */
export function offsetFromCenter(center: LatLng, distanceKm: number, index: number): LatLng {
  const angle = ((index * 57 + 13) % 360) * (Math.PI / 180);
  const km = Math.max(0.4, distanceKm || (index + 1) * 1.8);
  const dLat = (km / 111) * Math.cos(angle);
  const cosLat = Math.cos((center.latitude * Math.PI) / 180) || 0.01;
  const dLng = (km / (111 * cosLat)) * Math.sin(angle);
  return {
    latitude: center.latitude + dLat,
    longitude: center.longitude + dLng,
  };
}

/** Ensure every attraction keeps lat/lng (never discard after distance calc). */
export function ensureAttractionCoords<T extends {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  image?: string;
  latitude?: number;
  longitude?: number;
}>(items: T[], center: LatLng): (T & { latitude: number; longitude: number; distanceKm: number })[] {
  return (items || []).map((item, i) => {
    const hasCoords =
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude);
    const coords = hasCoords
      ? { latitude: item.latitude!, longitude: item.longitude! }
      : offsetFromCenter(center, item.distanceKm, i);
    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    return { ...item, ...coords, distanceKm };
  });
}

/** Ensure every service keeps lat/lng. */
export function ensureServiceCoords<T extends {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
}>(items: T[], center: LatLng): (T & { latitude: number; longitude: number; distanceKm: number })[] {
  return (items || []).map((item, i) => {
    const hasCoords =
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude);
    const coords = hasCoords
      ? { latitude: item.latitude!, longitude: item.longitude! }
      : offsetFromCenter(center, item.distanceKm || 1 + i * 0.4, i + 10);
    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    return { ...item, ...coords, distanceKm };
  });
}

function mapAmenityType(tags: Record<string, string> | undefined): string | null {
  const a = tags?.amenity;
  if (a === 'hospital' || a === 'clinic') return 'Hospital';
  if (a === 'police') return 'Police Station';
  if (a === 'fuel') return 'Petrol Pump';
  if (a === 'charging_station') return 'EV Charging';
  if (a === 'atm') return 'ATM';
  if (a === 'pharmacy') return 'Pharmacy';
  return null;
}

function mapAttractionCategory(tags: Record<string, string> | undefined): string {
  if (tags?.tourism === 'viewpoint') return 'Viewpoint';
  if (tags?.tourism === 'museum') return 'Museum';
  if (tags?.tourism === 'zoo') return 'Wildlife';
  if (tags?.natural === 'beach') return 'Beach';
  if (tags?.historic) return 'Heritage';
  if (tags?.leisure === 'park') return 'Park';
  return 'Attraction';
}

/**
 * Live Overpass query around a destination — keeps lat/lng on every result
 * (same pattern as route-navigation smart stops).
 */
export async function fetchDestinationNearbyPlaces(
  center: LatLng,
  radiusM = 12000,
): Promise<{ attractions: NearbyAttraction[]; services: NearbyService[] }> {
  const { latitude: lat, longitude: lon } = center;
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park"](around:${radiusM},${lat},${lon});
      way["tourism"~"attraction|museum|viewpoint|zoo|theme_park"](around:${radiusM},${lat},${lon});
      node["historic"~"monument|castle|fort|ruins|memorial"](around:${radiusM},${lat},${lon});
      way["historic"~"monument|castle|fort|ruins|memorial"](around:${radiusM},${lat},${lon});
      node["natural"="beach"](around:${radiusM},${lat},${lon});
      node["amenity"~"hospital|clinic|police|fuel|charging_station|atm|pharmacy"](around:${radiusM},${lat},${lon});
      way["amenity"~"hospital|clinic|police|fuel|charging_station|atm|pharmacy"](around:${radiusM},${lat},${lon});
    );
    out center 40;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'User-Agent': 'UrbanLens/1.0', 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = (await res.json()) as { elements?: OverpassElement[] };
  const elements = data.elements || [];

  const attractions: NearbyAttraction[] = [];
  const servicesByType = new Map<string, NearbyService>();

  for (const el of elements) {
    const coords = elementCoords(el);
    const name = el.tags?.name?.trim();
    if (!coords || !name) continue;

    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    const serviceType = mapAmenityType(el.tags);
    if (serviceType) {
      const prev = servicesByType.get(serviceType);
      if (!prev || distanceKm < prev.distanceKm) {
        servicesByType.set(serviceType, {
          id: `ov-${el.id}`,
          type: serviceType,
          name,
          distanceKm,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
      continue;
    }

    attractions.push({
      id: `ov-${el.id}`,
      name,
      category: mapAttractionCategory(el.tags),
      distanceKm,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  attractions.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    attractions: attractions.slice(0, 8),
    services: Array.from(servicesByType.values()).sort((a, b) => a.distanceKm - b.distanceKm),
  };
}
