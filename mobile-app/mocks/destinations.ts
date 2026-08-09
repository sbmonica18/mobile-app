export type Destination = {
  id: string;
  name: string;
  coverImage: string;
  matchScore: number;
  weather: string;
  aqi: number;
  budgetEstimate: string;
  travelTime: string;
  aiSummary: string;
  moods: string[];
  budgetTier: string[];
  timeFits: string[];
  styles: string[];
  categories: string[];
  popularity: number;
  coordinates: { latitude: number; longitude: number };
};

import { extraDestinations } from './catalogueExtra';

const baseDestinations: Destination[] = [];

export const mockDestinations: Destination[] = [...baseDestinations, ...extraDestinations];

/** True when the catalog cannot honestly answer this query. */
export function isUnmatchableTravelQuery(phrase: string): boolean {
  const p = phrase.trim().toLowerCase();
  if (p.length < 3) return true;
  if (/^[\\W\\d]+$/.test(p)) return true;
  if (/(asdf|qwer|zxcv|lorem|test123|blahblah)/.test(p)) return true;
  const knownIntent =
    /nature|mountain|hill|family|budget|cheap|weekend|food|cafe|coffee|photo|scenic|view|sunset|adventure|trek|hike|rain|monsoon|road|drive|ghat|hidden|quiet|gem|peaceful|calm|nearby|short|trip|getaway|escape|place|destination|lake|forest|wildlife|pilgrimage|spiritual|under|₹|rs|beach|coast|heritage|desert|island|temple|fort|palace|culture|architecture|raft|safari|backwater|yoga|sea|ocean|wild|city|biryani|backpack|monastery|wildlife/;
  if (!knownIntent.test(p) && !mockDestinations.some((d) => p.includes(d.name.toLowerCase()))) {
    return true;
  }
  return false;
}

export type IntentFilters = {
  mood?: string | null;
  budget?: string | null;
  time?: string | null;
  travelStyle?: string | null;
  transportMode?: string | null;
  priority?: string | null;
  phrase?: string | null;
  categoryId?: string | null;
};

import { EXPERIENCE_CATEGORIES } from './experienceCategories';

/** Fixed destination ids for an experience chip — never expand beyond this set. */
export function getExperiencePoolIds(categoryId: string | null | undefined): Set<string> | null {
  if (!categoryId) return null;
  const cat = EXPERIENCE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  if (cat.destinationIds?.length) return new Set(cat.destinationIds);
  return null;
}

/** Region keywords → destination ids for phrase boosts / soft filters. */
const REGION_IDS: Record<string, string[]> = {
  delhi: ['delhi', 'agra'],
  uttar: ['agra', 'varanasi', 'delhi'],
  rajasthan: ['jaipur', 'udaipur', 'jaisalmer', 'jodhpur', 'mount-abu', 'pushkar', 'ranthambore'],
  kerala: ['munnar', 'wayanad', 'kovalam', 'alleppey', 'kochi'],
  himachal: ['manali', 'shimla'],
  ladakh: ['leh'],
  goa: ['goa'],
  andaman: ['andaman'],
  uttarakhand: ['mussoorie', 'rishikesh', 'haridwar', 'nainital'],
  karnataka: ['coorg', 'hampi', 'mysore', 'bangalore'],
  maharashtra: ['mumbai', 'mahabaleshwar', 'ajanta-ellora', 'shirdi'],
  tamil: ['ooty', 'kodaikanal', 'chennai', 'madurai', 'rameswaram', 'pondicherry'],
  punjab: ['amritsar'],
  odisha: ['puri'],
  sikkim: ['gangtok'],
  gujarat: ['dwarka', 'rann-of-kutch'],
  bengal: ['kolkata', 'darjeeling'],
  telangana: ['hyderabad'],
  bihar: ['bodh-gaya'],
  andhra: ['tirupati'],
  jammu: ['vaishno-devi'],
  madhya: ['khajuraho'],
};

function parseTravelMinutes(travelTime: string): number {
  if (/flight/i.test(travelTime)) return 9999;
  const h = travelTime.match(/(\d+)\s*h/);
  const m = travelTime.match(/(\d+)\s*m/);
  const hours = h ? parseInt(h[1], 10) : 0;
  const mins = m ? parseInt(m[1], 10) : 0;
  if (!h && !m) return 9999;
  return hours * 60 + mins;
}

/** Strong intents must match real category tags — not soft scenic/sunset stand-ins. */
function hardCategoryFilter(phraseLower: string): ((d: Destination) => boolean) | null {
  if (/pilgrimage|temple|darshan|shrine/.test(phraseLower)) {
    return (d) => d.categories.some((c) => c === 'pilgrimage');
  }
  if (/spiritual|yoga|ashram/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /pilgrimage|spiritual/.test(c));
  }
  if (/metro|city|urban/.test(phraseLower) && !/metro.?station/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /metro|urban/.test(c));
  }
  if (/beach|coast|sea|ocean|island/.test(phraseLower)) {
    return (d) => d.categories.includes('beach') || d.categories.includes('coastal');
  }
  if (/wildlife|safari|rhino|tiger/.test(phraseLower)) {
    return (d) => d.categories.includes('wildlife');
  }
  if (/desert|dune|rann/.test(phraseLower)) {
    return (d) => d.categories.includes('desert');
  }
  if (/heritage|fort|palace|taj|monument|architecture/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /heritage|architecture|culture/.test(c));
  }
  if (/backwater|houseboat/.test(phraseLower)) {
    return (d) => d.id === 'alleppey' || d.categories.includes('backwaters') || d.categories.includes('lake');
  }
  if (
    /\b(food|biryani|cuisine)\b/.test(phraseLower) &&
    !/photo|nature|beach|heritage|wildlife|safari/.test(phraseLower)
  ) {
    return (d) => d.categories.some((c) => /food|cafe|coffee/.test(c));
  }
  return null;
}

function regionBoostIds(phraseLower: string): Set<string> {
  const ids = new Set<string>();
  for (const [region, list] of Object.entries(REGION_IDS)) {
    if (phraseLower.includes(region)) list.forEach((id) => ids.add(id));
  }
  if (/rajasthan|jaipur|udaipur|jaisalmer|jodhpur/.test(phraseLower)) {
    REGION_IDS.rajasthan.forEach((id) => ids.add(id));
  }
  return ids;
}

/** Client-side re-score — swap for API later. */
export function getRecommendations(filters: IntentFilters = {}): Destination[] {
  const { mood, budget, time, travelStyle, phrase, categoryId, priority } = filters;
  const phraseLower = (phrase || '').toLowerCase();
  const experiencePool = getExperiencePoolIds(categoryId);

  // Free-text nonsense only blocks when NOT scoped to an experience pool
  if (phrase && !experiencePool && isUnmatchableTravelQuery(phrase)) {
    return [];
  }

  const regionIds = phraseLower ? regionBoostIds(phraseLower) : new Set<string>();
  // Inside an experience pool, never hard-filter into a different category
  const hardFilter = phraseLower && !experiencePool ? hardCategoryFilter(phraseLower) : null;
  const wantsNearby = /nearby|short|quick|day trip|half.?day|weekend escape/.test(phraseLower);

  const universe = experiencePool
    ? mockDestinations.filter((d) => experiencePool.has(d.id))
    : mockDestinations;

  const scored = universe.map((d) => {
    let score = d.popularity * 0.45 + d.matchScore * 0.35;
    if (mood && d.moods.some((m) => m.toLowerCase() === mood.toLowerCase())) score += 12;
    if (budget && d.budgetTier.includes(budget)) score += 8;
    if (time && d.timeFits.includes(time)) score += 6;
    if (travelStyle && d.styles.some((s) => s.toLowerCase() === travelStyle.toLowerCase())) score += 6;

    if (phraseLower) {
      if (/nature|peace|relax|calm|hill|forest|lake|mountain/.test(phraseLower) && !/beach|wildlife|heritage|safari/.test(phraseLower)) {
        if (d.categories.some((c) => /nature|forest|lake|hills|mountains/.test(c))) score += 14;
        if (d.moods.includes('Relax')) score += 6;
      }
      if (/food|trail|cafe|coffee|cuisine|biryani/.test(phraseLower)) {
        if (d.categories.some((c) => /food|cafe|coffee/.test(c))) score += 20;
      }
      if (/photo|scenic|view|sunset/.test(phraseLower) && !/beach|heritage|wildlife/.test(phraseLower)) {
        if (d.categories.some((c) => /photo|views|scenic|sunset/.test(c))) score += 14;
        if (d.moods.includes('Explore')) score += 4;
      }
      if (/adventure|trek|hike|raft|paraglid/.test(phraseLower) && !/wildlife|safari/.test(phraseLower)) {
        if (d.categories.some((c) => /adventure|trekking|hills|mountains/.test(c))) score += 16;
      }
      if (/family|kids|children/.test(phraseLower)) {
        if (d.styles.some((s) => /family/i.test(s))) score += 14;
        if (d.categories.includes('family')) score += 8;
      }
      if (/weekend|nearby|short|quick|day trip/.test(phraseLower)) {
        if (d.categories.includes('weekend')) score += 14;
        const mins = parseTravelMinutes(d.travelTime);
        if (mins > 0 && mins <= 240) score += 18;
        else if (mins <= 360) score += 10;
        else if (mins >= 900) score -= 12;
      }
      if (/cheap|budget|affordable|under\s*₹?\s*[123]/.test(phraseLower)) {
        const destNum = parseInt(d.budgetEstimate.replace(/\D/g, ''), 10) || 99999;
        if (destNum <= 2500) score += 16;
        else if (destNum <= 3500) score += 8;
      }
      if (/rain|monsoon|mist/.test(phraseLower)) {
        if (d.categories.includes('rainy') || /cloud|mist|shower/i.test(d.weather)) score += 14;
      }
      if (/hidden|quiet|gem|peaceful/.test(phraseLower)) {
        if (d.categories.includes('hidden')) score += 16;
      }
      if (/road|drive|ghat/.test(phraseLower)) {
        if (d.categories.some((c) => /drive|road|ghats|scenic/.test(c))) score += 14;
      }
      if (/beach|coast|sea|ocean|island/.test(phraseLower)) {
        if (d.categories.includes('beach')) score += 28;
      }
      if (/pilgrimage|temple|darshan|shrine/.test(phraseLower)) {
        if (d.categories.includes('pilgrimage')) score += 30;
        if (d.categories.includes('spiritual')) score += 10;
      }
      if (/spiritual|yoga|ashram/.test(phraseLower) && !/pilgrimage|temple|darshan/.test(phraseLower)) {
        if (d.categories.some((c) => /pilgrimage|spiritual/.test(c))) score += 24;
      }
      if (/heritage|fort|palace|architecture|monument/.test(phraseLower)) {
        if (d.categories.some((c) => /heritage|architecture/.test(c))) score += 24;
      }
      if (/metro|city break|urban/.test(phraseLower)) {
        if (d.categories.some((c) => /metro|urban/.test(c))) score += 26;
      }
      if (/desert|sand|dune|rann/.test(phraseLower)) {
        if (d.categories.includes('desert') || d.id === 'jaisalmer' || d.id === 'rann-of-kutch') score += 28;
      }
      if (/wildlife|safari|rhino|tiger|elephant/.test(phraseLower)) {
        if (d.categories.includes('wildlife')) score += 28;
        if (/safari|tiger/.test(phraseLower) && d.id === 'ranthambore') score += 22;
      }
      if (/backwater|houseboat|canal/.test(phraseLower)) {
        if (d.id === 'alleppey' || d.categories.includes('lake')) score += 24;
      }
      if (regionIds.has(d.id)) score += 30;
      if (d.name.toLowerCase().includes(phraseLower)) score += 40;
      const nameTokens = d.name.toLowerCase().split(/\s+/);
      if (nameTokens.some((t) => t.length > 3 && phraseLower.includes(t))) score += 22;
      // Soft keyword overlap — ranks inside experience pool without leaving it
      if (experiencePool) {
        const hay = `${d.name} ${d.aiSummary} ${d.categories.join(' ')} ${d.styles.join(' ')}`.toLowerCase();
        const tokens = phraseLower.split(/\W+/).filter((t) => t.length > 3);
        for (const t of tokens) {
          if (hay.includes(t)) score += 8;
        }
      }
    }

    return {
      ...d,
      matchScore: Math.max(55, Math.min(99, Math.round(score))),
    };
  });

  let results = scored;

  // Strong intents: keep only real category matches (prevents Ooty showing for "beach")
  if (hardFilter) {
    const filtered = results.filter(hardFilter);
    if (filtered.length > 0) results = filtered;
  }

  // Region mention: prefer in-region, fall back to category matches if empty
  if (regionIds.size > 0) {
    const inRegion = results.filter((d) => regionIds.has(d.id));
    if (inRegion.length > 0) results = inRegion;
  }

  // "Nearby / weekend escape": drop ultra-long haul when shorter options exist
  if (wantsNearby) {
    const near = results.filter((d) => parseTravelMinutes(d.travelTime) <= 480);
    if (near.length >= 3) results = near;
  }

  // Tag fallback only when destinationIds are missing
  if (categoryId && !experiencePool) {
    const cat = EXPERIENCE_CATEGORIES.find((c) => c.id === categoryId);
    if (cat) {
      results = results.filter((d) =>
        d.categories?.some((c) => cat.matchingCategories.includes(c)),
      );
    }
  }

  if (mood) {
    const moodHits = results.filter((d) => d.moods.some((m) => m.toLowerCase() === mood.toLowerCase()));
    if (moodHits.length > 0) results = moodHits;
    else if (!experiencePool) results = moodHits;
  }

  if (budget && budget !== 'Flexible') {
    const isPreset = ['₹1000', '₹3000', '₹5000+'].includes(budget);
    let budgetHits: typeof results = [];
    if (isPreset) {
      budgetHits = results.filter((d) => d.budgetTier.includes(budget));
    } else {
      const budgetNum = parseInt(budget, 10);
      if (!isNaN(budgetNum)) {
        budgetHits = results.filter((d) => {
          const destNum = parseInt(d.budgetEstimate.replace(/\D/g, ''), 10) || 0;
          return destNum <= budgetNum;
        });
      }
    }
    if (budgetHits.length > 0) results = budgetHits;
    else if (!experiencePool) results = budgetHits;
  }

  if (time) {
    const isPreset = ['2 Hours', 'Half Day', 'One Day', 'Multi-day'].includes(time);
    let timeHits: typeof results = [];
    if (isPreset) {
      timeHits = results.filter((d) => d.timeFits.includes(time));
    } else {
      let totalHours = 0;
      const lower = time.toLowerCase();
      const num = parseFloat(lower) || 0;
      if (lower.includes('day')) totalHours = num * 24;
      else if (lower.includes('hour')) totalHours = num;

      if (totalHours > 0) {
        let mappedPreset = 'Multi-day';
        if (totalHours <= 4) mappedPreset = 'Half Day';
        else if (totalHours <= 12) mappedPreset = 'One Day';

        timeHits = results.filter(
          (d) => d.timeFits.includes(mappedPreset) || d.timeFits.includes('2 Hours'),
        );
      }
    }
    if (timeHits.length > 0) results = timeHits;
    else if (!experiencePool) results = timeHits;
  }

  if (travelStyle) {
    const styleHits = results.filter((d) =>
      d.styles.some((s) => s.toLowerCase() === travelStyle.toLowerCase()),
    );
    if (styleHits.length > 0) results = styleHits;
    else if (!experiencePool) results = styleHits;
  }

  const hasAny =
    Boolean(mood) || Boolean(budget) || Boolean(time) || Boolean(travelStyle) || Boolean(phrase) || Boolean(categoryId) || Boolean(priority);

  if (!hasAny) {
    return [...results].sort((a, b) => b.popularity - a.popularity);
  }

  // Final Sort based on priority
  if (priority) {
    if (priority === 'Air quality') {
      return results.sort((a, b) => a.aqi - b.aqi);
    }
    if (priority === 'Traffic') {
      const parseTime = (t: string) => {
        const hMatch = t.match(/(\d+)h/);
        const mMatch = t.match(/(\d+)m/);
        return (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
      };
      return results.sort((a, b) => parseTime(a.travelTime) - parseTime(b.travelTime));
    }
    if (priority === 'Budget') {
      const parseBudget = (b: string) => parseInt(b.replace(/\D/g, '')) || 0;
      return results.sort((a, b) => parseBudget(a.budgetEstimate) - parseBudget(b.budgetEstimate));
    }
    if (priority === 'Weather') {
      // Prioritize pleasant/cool weather
      const idealWeather = /pleasant|cool|clear|sunny/i;
      return results.sort((a, b) => {
        const aIdeal = idealWeather.test(a.weather) ? 1 : 0;
        const bIdeal = idealWeather.test(b.weather) ? 1 : 0;
        if (aIdeal !== bIdeal) return bIdeal - aIdeal;
        return b.matchScore - a.matchScore;
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function findDestinationByName(query: string): Destination | undefined {
  const q = query.trim().toLowerCase().replace(/[-_]+/g, ' ');
  if (q.length < 2) return undefined;

  const exact = mockDestinations.find((d) => {
    const name = d.name.toLowerCase();
    const id = d.id.toLowerCase().replace(/-/g, ' ');
    return name === q || id === q || d.id === query.trim().toLowerCase();
  });
  if (exact) return exact;

  const starts = mockDestinations.find((d) => {
    const name = d.name.toLowerCase();
    const id = d.id.toLowerCase().replace(/-/g, ' ');
    return name.startsWith(q) || id.startsWith(q);
  });
  if (starts) return starts;

  return mockDestinations.find((d) => {
    const name = d.name.toLowerCase();
    const id = d.id.toLowerCase().replace(/-/g, ' ');
    return name.includes(q) || id.includes(q);
  });
}

export function looksLikeIntentPhrase(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length < 4) return false;
  if (findDestinationByName(q)) return false;
  return /(under|budget|weekend|trip|relax|nature|food|photo|hours?|day|family|friends|solo|₹|rs\.?)/i.test(
    q,
  );
}
