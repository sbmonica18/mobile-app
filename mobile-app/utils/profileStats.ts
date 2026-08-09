import type { JourneyStoryPayload } from '@/types/journeyStory';

export type TravelStats = {
  tripsCompleted: number;
  totalDistanceKm: number;
  placesVisited: number;
  /** Distinct place display names, in visit order (most recent first). */
  placeNames: string[];
  totalSpentInr: number;
  weekendTrips: number;
  tripsWithBudget: number;
};

export type ProfileAchievement = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  unlocked: boolean;
  conditionLabel: string;
};

function tripDaysOf(story: JourneyStoryPayload): number {
  if (story.tripDays && story.tripDays > 0) return story.tripDays;
  const mins = story.statistics?.travelMinutes ?? 0;
  if (mins <= 12 * 60) return 1;
  if (mins <= 30 * 60) return 2;
  return Math.max(3, Math.round(mins / (12 * 60)));
}

/** Aggregate real vault journeys — zeros when empty. Never invents numbers. */
export function computeTravelStats(vault: JourneyStoryPayload[]): TravelStats {
  const trips = vault || [];
  const placeKeys = new Set<string>();
  const placeNames: string[] = [];
  let totalDistanceKm = 0;
  let totalSpentInr = 0;
  let weekendTrips = 0;
  let tripsWithBudget = 0;

  for (const trip of trips) {
    const name = (trip.destinationName || '').trim();
    const key = (trip.destinationId || name).trim().toLowerCase();
    if (key && !placeKeys.has(key)) {
      placeKeys.add(key);
      if (name) placeNames.push(name);
    }

    const dist = Number(trip.statistics?.distanceKm) || 0;
    totalDistanceKm += dist;

    const spent = Number(trip.statistics?.totalBudgetInr) || 0;
    if (spent > 0) {
      totalSpentInr += spent;
      tripsWithBudget += 1;
    }

    const days = tripDaysOf(trip);
    if (days >= 1 && days <= 2) weekendTrips += 1;
  }

  return {
    tripsCompleted: trips.length,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    placesVisited: placeKeys.size,
    placeNames,
    totalSpentInr: Math.round(totalSpentInr),
    weekendTrips,
    tripsWithBudget,
  };
}

/** Unlock state computed live from stats — never a stale stored flag. */
export function computeAchievements(stats: TravelStats): ProfileAchievement[] {
  return [
    {
      id: 'first-journey',
      title: 'First Journey',
      subtitle: 'You completed your first trip',
      icon: 'flag-outline',
      unlocked: stats.tripsCompleted >= 1,
      conditionLabel: 'Complete your first trip to unlock',
    },
    {
      id: 'explorer',
      title: 'Explorer',
      subtitle: '5+ distinct destinations visited',
      icon: 'compass-outline',
      unlocked: stats.placesVisited >= 5,
      conditionLabel: 'Visit 5 different places to unlock',
    },
    {
      id: 'road-warrior',
      title: 'Road Warrior',
      subtitle: '500+ km traveled',
      icon: 'car-outline',
      unlocked: stats.totalDistanceKm >= 500,
      conditionLabel: 'Travel 500+ km total to unlock',
    },
    {
      id: 'budget-master',
      title: 'Budget Master',
      subtitle: 'Completed a budgeted trip',
      icon: 'wallet-outline',
      unlocked: stats.tripsWithBudget >= 1,
      conditionLabel: 'Complete a trip with a real budget total to unlock',
    },
    {
      id: 'weekend-wanderer',
      title: 'Weekend Wanderer',
      subtitle: '3+ short 1–2 day trips',
      icon: 'sunny-outline',
      unlocked: stats.weekendTrips >= 3,
      conditionLabel: 'Finish 3 trips lasting 1–2 days to unlock',
    },
  ];
}
