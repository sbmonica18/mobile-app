/**
 * Place search suggestions — derived from the curated destination catalogue
 * so Home search always covers every UrbanLens destination.
 */
import { mockDestinations } from './destinations';
import { mockDestinationIntelligence } from './destinationIntelligence';

export interface Place {
  id: string;
  name: string;
  region: string;
  coordinates: { lat: number; lng: number };
}

const stateById: Record<string, string> = Object.fromEntries(
  mockDestinationIntelligence.map((d) => [d.id, d.state]),
);

/** Full catalogue as searchable places (single source of truth). */
export const mockPlaces: Place[] = mockDestinations.map((d) => ({
  id: d.id,
  name: d.name,
  region: stateById[d.id] || 'India',
  coordinates: {
    lat: d.coordinates.latitude,
    lng: d.coordinates.longitude,
  },
}));

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[-_]+/g, ' ');
}

/** Ranked suggestions from the curated catalogue. */
export function getPlaceSuggestions(query: string): Place[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const scored = mockPlaces
    .map((p) => {
      const name = normalize(p.name);
      const id = normalize(p.id);
      const region = normalize(p.region);
      let score = 0;
      if (name === q || id === q) score = 100;
      else if (name.startsWith(q) || id.startsWith(q)) score = 80;
      else if (name.includes(q) || id.includes(q)) score = 60;
      else if (region.startsWith(q) || region.includes(q)) score = 40;
      return { place: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name));

  return scored.slice(0, 12).map((x) => x.place);
}
