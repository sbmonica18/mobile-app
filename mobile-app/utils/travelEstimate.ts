import { haversineKm, type LatLng } from '@/services/routeService';

/** Straight-line → typical Indian highway/ghat road distance. */
const ROAD_FACTOR = 1.35;

export type TravelEstimate = {
  distanceKm: number;
  travelTimeMin: number;
  travelTime: string;
};

export function formatTravelTime(totalMin: number): string {
  const mins = Math.max(1, Math.round(totalMin));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Average speed by trip length (km/h) — includes traffic + ghats. */
function avgSpeedKmh(roadKm: number): number {
  if (roadKm < 60) return 32;
  if (roadKm < 150) return 40;
  if (roadKm < 400) return 48;
  return 55;
}

/**
 * Approximate road distance + drive time from origin → destination.
 * Uses haversine × road factor (not live OSRM) so every card stays consistent offline.
 */
export function estimateTravel(origin: LatLng, destination: LatLng): TravelEstimate {
  const straight = haversineKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );
  const distanceKm = Math.max(1, Math.round(straight * ROAD_FACTOR));
  const travelTimeMin = Math.max(5, Math.round((distanceKm / avgSpeedKmh(distanceKm)) * 60));
  return {
    distanceKm,
    travelTimeMin,
    travelTime: formatTravelTime(travelTimeMin),
  };
}

export function withTravelFromOrigin<T extends { coordinates: LatLng; travelTime: string }>(
  items: T[],
  origin: LatLng | null | undefined,
): T[] {
  if (!origin?.latitude || !origin?.longitude) return items;
  return items.map((item) => {
    const est = estimateTravel(origin, item.coordinates);
    return { ...item, travelTime: est.travelTime };
  });
}
