export type LatLng = {
  latitude: number;
  longitude: number;
};

export type DrivingRoute = {
  id: string;
  distanceKm: number;
  durationMinutes: number;
  coordinates: LatLng[];
  summary: string;
};

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const CACHE = new Map<string, DrivingRoute[]>();

function roundCoord(n: number) {
  return Math.round(n * 10_000) / 10_000;
}

function cacheKey(origin: LatLng, destination: LatLng) {
  return `${roundCoord(origin.latitude)},${roundCoord(origin.longitude)}->${roundCoord(destination.latitude)},${roundCoord(destination.longitude)}`;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function haversineFallback(origin: LatLng, destination: LatLng): DrivingRoute[] {
  const distanceKm = haversineKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );
  const durationMinutes = (distanceKm / 35) * 60;
  return [
    {
      id: 'straight',
      distanceKm,
      durationMinutes,
      coordinates: [origin, destination],
      summary: 'Direct (approx.)',
    },
  ];
}

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry?: {
    coordinates?: [number, number][];
  };
};

async function fetchWithTimeout(url: string, ms = 12_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function labelForRoute(index: number, distanceKm: number, durationMinutes: number) {
  if (index === 0) return `Fastest · ${distanceKm.toFixed(0)} km · ${Math.round(durationMinutes)} min`;
  return `Alt ${index} · ${distanceKm.toFixed(0)} km · ${Math.round(durationMinutes)} min`;
}

/**
 * Fetch driving routes via public OSRM. Falls back to straight-line haversine on failure.
 */
export async function fetchDrivingRoutes(
  origin: LatLng,
  destination: LatLng,
): Promise<DrivingRoute[]> {
  const key = cacheKey(origin, destination);
  const cached = CACHE.get(key);
  if (cached?.length) return cached;

  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&alternatives=true`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`OSRM ${response.status}`);
    const data = (await response.json()) as { code?: string; routes?: OsrmRoute[] };
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No routes');

    const routes: DrivingRoute[] = data.routes.slice(0, 3).map((route, index) => {
      const distanceKm = route.distance / 1000;
      const durationMinutes = route.duration / 60;
      const coordinates =
        route.geometry?.coordinates?.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })) ?? [origin, destination];

      return {
        id: `osrm-${index}`,
        distanceKm,
        durationMinutes,
        coordinates,
        summary: labelForRoute(index, distanceKm, durationMinutes),
      };
    });

    CACHE.set(key, routes);
    return routes;
  } catch {
    const fallback = haversineFallback(origin, destination);
    CACHE.set(key, fallback);
    return fallback;
  }
}

export function clearRouteCache() {
  CACHE.clear();
}
