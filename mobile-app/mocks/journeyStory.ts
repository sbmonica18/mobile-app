import type {
  JourneyStoryPayload,
  JourneyStorySeed,
} from '@/types/journeyStory';

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80';

const STOP_IMAGES = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3bb28d58d9?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
];

function formatWhen(date = new Date()) {
  return date.toLocaleString('en-IN', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Client-side cinematic story — swap for API later. */
export function buildJourneyStory(seed: JourneyStorySeed): JourneyStoryPayload {
  const dest = seed.destinationName?.split(',')[0]?.trim() || 'Your destination';
  const origin = seed.originName?.split(',')[0]?.trim() || 'Home';
  const distanceKm = Math.max(12, Number(seed.distanceKm?.toFixed?.(1) ?? seed.distanceKm) || 186);
  const travelMinutes = Math.max(35, Math.round(seed.durationMinutes || distanceKm * 1.35));
  const hours = Math.floor(travelMinutes / 60);
  const mins = travelMinutes % 60;
  const weather = seed.weatherLabel || 'Pleasant & clear';
  const id = `journey_${Date.now()}`;

  const avgSpeed = Math.round((distanceKm / (travelMinutes / 60)) * 10) / 10;
  const fuelLiters = Math.round(distanceKm * 0.08 * 10) / 10;
  const fuelCostDefault = Math.round(fuelLiters * 105);
  const parking = 80;
  const tolls = distanceKm > 100 ? 240 : 60;
  const estimatedBudget =
    seed.estimatedBudgetInr && seed.estimatedBudgetInr > 0
      ? Math.round(seed.estimatedBudgetInr)
      : fuelCostDefault + parking + tolls + 450;
  const hasActual = seed.actualTotalBudgetInr != null && seed.actualTotalBudgetInr >= 0;
  const totalBudget = hasActual ? Math.round(seed.actualTotalBudgetInr!) : estimatedBudget;
  const fuelCost =
    seed.actualFuelCostInr != null && seed.actualFuelCostInr >= 0
      ? Math.round(seed.actualFuelCostInr)
      : fuelCostDefault;
  const foodCost =
    seed.actualFoodCostInr != null && seed.actualFoodCostInr >= 0
      ? Math.round(seed.actualFoodCostInr)
      : 450;
  const otherCost =
    seed.actualOtherCostInr != null && seed.actualOtherCostInr >= 0
      ? Math.round(seed.actualOtherCostInr)
      : parking + tolls;
  const carbon = Math.round(fuelLiters * 2.31 * 10) / 10;
  const stops = 4;
  const budgetDelta = totalBudget - estimatedBudget;
  const budgetScore = Math.min(
    98,
    Math.max(70, 90 - Math.round(Math.abs(budgetDelta) / Math.max(estimatedBudget, 1) * 40)),
  );
  const score = Math.min(98, Math.max(82, 88 + Math.round((100 - Math.min(distanceKm, 300) / 20) % 10)));
  const tripDays =
    seed.tripDays && seed.tripDays > 0
      ? Math.round(seed.tripDays)
      : travelMinutes <= 12 * 60
        ? 1
        : travelMinutes <= 30 * 60
          ? 2
          : Math.max(3, Math.round(travelMinutes / (12 * 60)));

  return {
    id,
    destinationName: dest,
    destinationId: seed.destinationId,
    destinationImage: seed.destinationImage || HERO_FALLBACK,
    originName: origin,
    completedAt: formatWhen(),
    weatherLabel: weather,
    tripDays,
    narrative:
      `Today you left ${origin} behind and found your way into the calm of ${dest}. ` +
      `${weather} skies, manageable traffic, and clean air made this one of your smoothest escapes. ` +
      `You paused for scenic views, tasted a local stop along the way, and arrived with time to spare — ` +
      `before the evening crowds settled in. After exploring, you completed the full tour by returning to ${origin}. ` +
      (hasActual
        ? `Your real spend was ₹${totalBudget.toLocaleString('en-IN')} vs a default estimate of ₹${estimatedBudget.toLocaleString('en-IN')}.`
        : `The light at the end of the road felt worth every kilometre.`),
    statistics: {
      distanceKm: Math.round(distanceKm * 10) / 10,
      travelMinutes,
      avgSpeedKmh: avgSpeed,
      maxSpeedKmh: Math.round(avgSpeed * 1.35),
      fuelLiters,
      fuelCostInr: fuelCost,
      parkingCostInr: parking,
      tollsInr: tolls,
      estimatedBudgetInr: estimatedBudget,
      totalBudgetInr: totalBudget,
      foodCostInr: foodCost,
      otherCostInr: otherCost,
      carbonKg: carbon,
      caloriesWalked: 320 + stops * 40,
      stopsMade: stops,
    },
    timeline: [
      {
        id: 't1',
        title: origin,
        time: '9:10 AM',
        duration: '—',
        note: 'Journey began',
        mood: 'Excited',
        imageUrl: STOP_IMAGES[0],
        kind: 'start',
      },
      {
        id: 't2',
        title: 'Fuel & stretch',
        time: '10:05 AM',
        duration: '12 min',
        note: 'Quick pit stop',
        mood: 'Focused',
        imageUrl: STOP_IMAGES[1],
        kind: 'stop',
      },
      {
        id: 't3',
        title: 'Scenic overlook',
        time: hours >= 2 ? '12:20 PM' : '11:40 AM',
        duration: '25 min',
        note: 'Best view of the day',
        mood: 'Awe',
        imageUrl: STOP_IMAGES[2],
        kind: 'poi',
      },
      {
        id: 't4',
        title: 'Local café',
        time: hours >= 3 ? '2:10 PM' : '1:05 PM',
        duration: '40 min',
        note: 'Warm meal, quiet corner',
        mood: 'Relaxed',
        imageUrl: STOP_IMAGES[3],
        kind: 'stop',
      },
      {
        id: 't5',
        title: dest,
        time: formatWhen().split('•').pop()?.trim() || 'Evening',
        duration: `${hours}h ${mins}m total`,
        note: 'You arrived',
        mood: 'Joyful',
        imageUrl: seed.destinationImage || STOP_IMAGES[4],
        kind: 'destination',
      },
    ],
    highlights: [
      {
        id: 'h1',
        title: 'Best View',
        description: `Open horizon just before ${dest}.`,
        badge: 'Scenic',
        imageUrl: STOP_IMAGES[2],
        gradient: ['#0EA5E9', '#2563EB'],
      },
      {
        id: 'h2',
        title: 'Best Weather',
        description: weather,
        badge: 'Clear',
        imageUrl: STOP_IMAGES[4],
        gradient: ['#14B8A6', '#0D9488'],
      },
      {
        id: 'h3',
        title: 'Quietest Place',
        description: 'A calm stretch with almost no traffic.',
        badge: 'Peace',
        imageUrl: STOP_IMAGES[0],
        gradient: ['#8B5CF6', '#6366F1'],
      },
      {
        id: 'h4',
        title: 'Highest AI Score',
        description: 'Conditions aligned almost perfectly today.',
        badge: `${score}`,
        imageUrl: STOP_IMAGES[1],
        gradient: ['#F59E0B', '#EA580C'],
      },
    ],
    memories: [
      { id: 'm1', imageUrl: STOP_IMAGES[2], caption: 'Golden overlook', favorited: true },
      { id: 'm2', imageUrl: STOP_IMAGES[3], caption: 'Roadside pause' },
      { id: 'm3', imageUrl: STOP_IMAGES[0], caption: 'Leaving the city' },
      { id: 'm4', imageUrl: seed.destinationImage || STOP_IMAGES[4], caption: `${dest} arrival`, favorited: true },
      { id: 'm5', imageUrl: STOP_IMAGES[1], caption: 'Soft light' },
    ],
    environment: [
      { label: 'Weather', value: 88, unit: '%' },
      { label: 'AQI', value: 42 },
      { label: 'UV', value: 5 },
      { label: 'Wind', value: 12, unit: 'km/h' },
      { label: 'Traffic', value: 28, unit: '%' },
      { label: 'Crowds', value: 35, unit: '%' },
    ],
    travelScore: score,
    scoreFactors: [
      { key: 'weather', label: 'Weather', score: 92, reason: 'Clear skies with soft light.' },
      { key: 'traffic', label: 'Traffic', score: 86, reason: 'Light congestion most of the way.' },
      { key: 'parking', label: 'Parking', score: 80, reason: 'Easy arrival parking near destination.' },
      { key: 'budget', label: 'Budget', score: budgetScore, reason: hasActual
        ? `Real ₹${totalBudget} vs estimate ₹${estimatedBudget}.`
        : `About ₹${totalBudget} all-in.` },
      { key: 'safety', label: 'Safety', score: 91, reason: 'Steady roads and calm conditions.' },
      { key: 'photo', label: 'Photography', score: 89, reason: 'Several golden-hour moments.' },
      { key: 'comfort', label: 'Comfort', score: 87, reason: 'Well-paced stops, no rush.' },
    ],
    achievements: [
      { id: 'a1', title: 'Road Trip', subtitle: 'Completed a multi-stop drive', icon: 'car-outline', unlocked: true },
      { id: 'a2', title: 'Nature Lover', subtitle: 'Chose a scenic destination', icon: 'leaf-outline', unlocked: true },
      { id: 'a3', title: 'Smooth Journey', subtitle: 'High comfort & traffic score', icon: 'sparkles-outline', unlocked: score >= 88 },
      { id: 'a4', title: 'Weekend Escape', subtitle: 'Got away from the city', icon: 'sunny-outline', unlocked: true },
      { id: 'a5', title: 'Photographer', subtitle: 'Captured memorable light', icon: 'camera-outline', unlocked: true },
      { id: 'a6', title: 'Mountain Explorer', subtitle: 'Unlocked hill destinations', icon: 'trail-sign-outline', unlocked: /ooty|munnar|coorg|kodai|hill|valley/i.test(dest) },
    ],
    routeCoordinates: seed.routeCoordinates?.length
      ? seed.routeCoordinates
      : [
          { latitude: 12.97, longitude: 77.59 },
          { latitude: 12.5, longitude: 77.2 },
          { latitude: 11.9, longitude: 76.8 },
          { latitude: 11.41, longitude: 76.7 },
        ],
    savedToVault: false,
  };
}
