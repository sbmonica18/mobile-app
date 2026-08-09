/**
 * Destination detail intelligence mock.
 *
 * Before adding or changing heroImage / attraction images / services, run:
 *   npm run validate:images
 * The check rejects empty URLs, banned hosts (loremflickr/placeholders),
 * duplicate images within a destination, duplicate heroes/covers, and
 * missing essential service categories.
 */
import { mockDestinations } from '@/mocks/destinations';
import { estimateTravel } from '@/utils/travelEstimate';
import { ensureAttractionCoords, ensureServiceCoords } from '@/services/destinationNearbyPlaces';
import { extraIntelligence } from './catalogueExtra';
export interface DestinationIntelligence {
  id: string;
  name: string;
  state: string;
  heroImage: string;
  matchScore: number;
  distanceKm: number;
  travelTimeMin: number;
  aiSummary: string;
  readinessScore: number; // 0-100
  readinessBand: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  travelConditions: { fuelCost: number; tollCost: number; totalCost: number };
  environment: {
    weather: string;
    tempC: number;
    aqi: number;
    aqiStatus: string;
    uv: number;
    uvStatus: string;
    rainProbability: number;
    windSpeed: string;
  };
  budget: {
    fuel: number;
    food: number;
    entryFees: number;
    parking: number;
    accommodation: number;
    total: number;
    tier: 'Budget Friendly' | 'Moderate' | 'Premium';
  };
  crowdSafety: {
    crowdLevel: string;
    safetyRating: string;
    parkingAvailability: string;
    roadConditions: string;
  };
  attractions: {
    id: string;
    name: string;
    category: string;
    distanceKm: number;
    image: string;
    /** Real spot coordinates — retained for Navigate (not discarded after distance). */
    latitude?: number;
    longitude?: number;
  }[];
  services: {
    id: string;
    type: string;
    name: string;
    distanceKm: number;
    /** Real spot coordinates — retained for Navigate (not discarded after distance). */
    latitude?: number;
    longitude?: number;
  }[];
  bestTime: {
    Morning: { window: string; reason: string };
    Afternoon: { window: string; reason: string };
    Evening: { window: string; reason: string };
    Night: { window: string; reason: string };
  };
  travelTips: string[];
}

const baseDestinationIntelligence: DestinationIntelligence[] = [];

export const mockDestinationIntelligence: DestinationIntelligence[] = [
  ...baseDestinationIntelligence,
  ...extraIntelligence,
];

export function getDestinationIntelligence(
  id: string,
  origin?: { latitude: number; longitude: number } | null,
): DestinationIntelligence {
  const dest = mockDestinationIntelligence.find((d) => d.id === id);
  const base = dest ? { ...dest } : { ...mockDestinationIntelligence[0], id };

  // Prefer live estimate from user GPS over hardcoded Bangalore-centric mocks
  const catalog = mockDestinations.find((d) => d.id === base.id);
  if (origin?.latitude && origin?.longitude && catalog?.coordinates) {
    const est = estimateTravel(origin, catalog.coordinates);
    base.distanceKm = est.distanceKm;
    base.travelTimeMin = est.travelTimeMin;
  } else if (catalog?.coordinates && !origin) {
    // No GPS yet — leave catalogue defaults, but never invent "1h" for far places
  }

  // Attach / retain lat-lng on every attraction & service (fallback near destination center)
  if (catalog?.coordinates) {
    base.attractions = ensureAttractionCoords(base.attractions, catalog.coordinates);
    base.services = ensureServiceCoords(base.services, catalog.coordinates);
  }

  return base;
}
