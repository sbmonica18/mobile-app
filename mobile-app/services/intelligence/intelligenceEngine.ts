import type {
  DestinationPulse,
  IdealPlan,
  IntelligenceEngineInput,
  IntelligenceEvent,
  IntelligenceImpact,
  IntelligencePriority,
  IntelligenceSignal,
  WhatChangedSnapshot,
  WhyBreakdown,
} from './intelligenceTypes';

function hourOf(d: Date) {
  return d.getHours() + d.getMinutes() / 60;
}

function formatClock(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60_000);
}

/** Heuristic mobility pressure from clock — labeled estimated, never claimed as live traffic. */
export function estimateMobilityPressure(now: Date): {
  label: string;
  score: number;
  level: 'Light' | 'Moderate' | 'Heavy';
} {
  const h = hourOf(now);
  if ((h >= 8 && h < 10.5) || (h >= 17 && h < 20.5)) {
    return { label: 'Rush-hour pressure (estimated)', score: 38, level: 'Heavy' };
  }
  if ((h >= 12 && h < 14) || (h >= 16 && h < 17)) {
    return { label: 'Building traffic (estimated)', score: 58, level: 'Moderate' };
  }
  return { label: 'Typically lighter (estimated)', score: 78, level: 'Light' };
}

export function estimateCrowdLevel(now: Date, rainProbability?: number): {
  label: string;
  score: number;
} {
  const h = hourOf(now);
  let score = 70;
  if (h >= 10 && h < 13) score = 55;
  if (h >= 16 && h < 19) score = 45;
  if (typeof rainProbability === 'number' && rainProbability >= 55) score += 15;
  score = Math.max(25, Math.min(92, score));
  const label = score >= 70 ? 'Quieter' : score >= 50 ? 'Moderate' : 'Busier';
  return { label, score };
}

export function estimateParking(now: Date): { label: string; score: number } {
  const h = hourOf(now);
  if (h >= 11 && h < 14) return { label: 'May be limited (estimated)', score: 45 };
  if (h >= 17 && h < 21) return { label: 'Often tight (estimated)', score: 40 };
  return { label: 'Usually available (estimated)', score: 72 };
}

export function priorityColor(priority: IntelligencePriority): string {
  switch (priority) {
    case 'CRITICAL':
      return '#EF4444';
    case 'HIGH':
      return '#F59E0B';
    case 'MEDIUM':
      return '#14B8A6';
    default:
      return '#64748B';
  }
}

export function buildSignals(input: IntelligenceEngineInput): IntelligenceSignal[] {
  const w = input.weather;
  const hasLoc = input.latitude != null && input.longitude != null;
  const mobility = estimateMobilityPressure(input.now ?? new Date());
  const crowd = estimateCrowdLevel(input.now ?? new Date(), w?.rainProbability);
  const parking = estimateParking(input.now ?? new Date());

  return [
    {
      key: 'location',
      label: 'Location',
      status: hasLoc ? 'available' : 'unavailable',
      valueLabel: hasLoc ? input.areaLabel || 'GPS fixed' : 'Unavailable',
      score: hasLoc ? 90 : undefined,
    },
    {
      key: 'weather',
      label: 'Weather',
      status: w ? 'available' : 'unavailable',
      valueLabel: w ? `${w.description} · ${w.temperatureC}°C` : 'Unavailable',
      score: w ? weatherSuitability(w) : undefined,
    },
    {
      key: 'rain',
      label: 'Rain risk',
      status: w?.rainProbability != null ? 'available' : 'unavailable',
      valueLabel:
        w?.rainProbability != null ? `${w.rainProbability}% next hours` : 'Unavailable',
      score: w?.rainProbability != null ? Math.max(0, 100 - w.rainProbability) : undefined,
    },
    {
      key: 'aqi',
      label: 'Air quality',
      status: w?.aqi != null ? 'available' : 'unavailable',
      valueLabel: w?.aqi != null ? `US AQI ${w.aqi}` : 'Unavailable',
      score: w?.aqi != null ? aqiScore(w.aqi) : undefined,
    },
    {
      key: 'uv',
      label: 'UV',
      status: w?.uvIndex != null ? 'available' : 'unavailable',
      valueLabel: w?.uvIndex != null ? String(w.uvIndex) : 'Unavailable',
      score: w?.uvIndex != null ? Math.max(20, 100 - w.uvIndex * 8) : undefined,
    },
    {
      key: 'traffic',
      label: 'Traffic',
      status: 'estimated',
      valueLabel: mobility.label,
      score: mobility.score,
    },
    {
      key: 'crowd',
      label: 'Crowd',
      status: 'estimated',
      valueLabel: `${crowd.label} · time-based estimate`,
      score: crowd.score,
    },
    {
      key: 'parking',
      label: 'Parking',
      status: 'estimated',
      valueLabel: parking.label,
      score: parking.score,
    },
    {
      key: 'roads',
      label: 'Roads',
      status: 'unavailable',
      valueLabel: 'Live closures not connected',
    },
    {
      key: 'destination',
      label: 'Destination',
      status: input.destination ? 'available' : 'unavailable',
      valueLabel: input.destination?.name ?? 'None selected',
      score: input.destination?.matchScore,
    },
  ];
}

function weatherSuitability(w: NonNullable<IntelligenceEngineInput['weather']>) {
  let score = 78;
  if (w.rainProbability != null && w.rainProbability >= 60) score -= 28;
  else if (w.rainProbability != null && w.rainProbability >= 35) score -= 12;
  if (w.temperatureC >= 36 || w.temperatureC <= 14) score -= 10;
  if (w.code >= 95) score -= 35;
  else if (w.code >= 80) score -= 18;
  else if (w.code >= 61) score -= 12;
  return Math.max(15, Math.min(95, score));
}

function aqiScore(aqi: number) {
  if (aqi <= 50) return 90;
  if (aqi <= 100) return 72;
  if (aqi <= 150) return 48;
  return 28;
}

export function buildEvents(input: IntelligenceEngineInput, signals: IntelligenceSignal[]): IntelligenceEvent[] {
  const now = input.now ?? new Date();
  const events: IntelligenceEvent[] = [];
  const w = input.weather;
  const mobility = estimateMobilityPressure(now);
  const crowd = estimateCrowdLevel(now, w?.rainProbability);

  if (w?.rainProbability != null && w.rainProbability >= 45) {
    const mins = Math.max(20, Math.round(70 - w.rainProbability / 2));
    events.push({
      id: `weather-rain-${now.getHours()}`,
      type: 'WEATHER_CHANGE',
      priority: w.rainProbability >= 70 ? 'HIGH' : 'MEDIUM',
      title: 'Rain probability rising',
      description: `Rain chance is about ${w.rainProbability}% in the coming hours (Open-Meteo). Outdoor stops are better sooner.`,
      timestamp: now.toISOString(),
      locationLabel: input.areaLabel ?? undefined,
      impact: 'Outdoor attractions may become less comfortable.',
      recommendation: `Prioritize open-air viewpoints in the next ~${mins} minutes if that fits your plan.`,
      action: 'ADJUST_PLAN',
      actionLabel: 'Adjust my plan',
      confidence: 78,
      source: 'live',
      icon: 'rainy-outline',
    });
  } else if (w && weatherSuitability(w) >= 75) {
    events.push({
      id: `weather-good-${now.getHours()}`,
      type: 'OPPORTUNITY',
      priority: 'MEDIUM',
      title: 'Outdoor conditions look favorable',
      description: `${w.description}, ${w.temperatureC}°C — a solid window for scenic or outdoor stops.`,
      timestamp: now.toISOString(),
      impact: 'Outdoor plans are currently well supported by weather.',
      recommendation: 'If you were waiting for clearer skies, this is a good moment to go.',
      action: 'GO_NOW',
      actionLabel: 'Explore now',
      confidence: 74,
      source: 'live',
      icon: 'sunny-outline',
    });
  }

  if (mobility.level !== 'Light') {
    events.push({
      id: `mobility-${mobility.level}-${now.getHours()}`,
      type: 'MOBILITY',
      priority: mobility.level === 'Heavy' ? 'HIGH' : 'MEDIUM',
      title: `Mobility: ${mobility.level.toLowerCase()} period`,
      description:
        'UrbanLens does not have live traffic feeds. This is a time-of-day estimate for typical congestion.',
      timestamp: now.toISOString(),
      impact: 'Travel times may stretch vs midday baselines.',
      recommendation: 'Leave a buffer, or review an alternate OSRM route before you start.',
      action: 'REVIEW_ROUTE',
      actionLabel: 'Review route',
      confidence: 55,
      source: 'estimated',
      icon: 'car-outline',
    });
  }

  if (crowd.score < 55) {
    events.push({
      id: `crowd-${now.getHours()}`,
      type: 'CROWD_SHIFT',
      priority: 'MEDIUM',
      title: 'Crowd pressure may be higher',
      description:
        'Estimated from typical visiting hours — not a live venue sensor. Quieter alternatives may feel better.',
      timestamp: now.toISOString(),
      impact: 'Popular attractions can feel busier now.',
      recommendation: 'Prefer secondary spots first, then peak attractions later.',
      action: 'EXPLORE_ALTERNATIVE',
      actionLabel: 'Explore alternative',
      confidence: 52,
      source: 'estimated',
      icon: 'people-outline',
    });
  }

  if (w?.aqi != null && w.aqi > 100) {
    events.push({
      id: `aqi-${w.aqi}`,
      type: 'AQI',
      priority: w.aqi > 150 ? 'HIGH' : 'MEDIUM',
      title: 'Air quality is elevated',
      description: `US AQI is ${w.aqi}. Sensitive travelers may prefer shorter outdoor exposure.`,
      timestamp: now.toISOString(),
      impact: 'Long outdoor walks may feel harder.',
      recommendation: 'Favor indoor or shorter outdoor segments.',
      action: 'ADJUST_PLAN',
      actionLabel: 'Adjust my plan',
      confidence: 80,
      source: 'live',
      icon: 'leaf-outline',
    });
  }

  const unavailable = signals.filter((s) => s.status === 'unavailable').length;
  if (unavailable >= 2) {
    events.push({
      id: 'signal-gap',
      type: 'SIGNAL_GAP',
      priority: 'LOW',
      title: 'Some signals are unavailable',
      description: `${unavailable} signal(s) are missing. UrbanLens continues with weather, location, and time-based estimates only.`,
      timestamp: now.toISOString(),
      impact: 'Recommendations stay partial — never fabricated as live.',
      recommendation: 'Refresh when online, or proceed with available signals.',
      action: 'NONE',
      actionLabel: 'Understood',
      confidence: 90,
      source: 'partial',
      icon: 'information-circle-outline',
    });
  }

  if (input.destination) {
    const pulse = buildDestinationPulse(input);
    events.push({
      id: `dest-window-${input.destination.id}`,
      type: 'DESTINATION_WINDOW',
      priority: 'MEDIUM',
      title: `${input.destination.name}: ${pulse.verdict.toLowerCase()} right now`,
      description: pulse.verdictLine,
      timestamp: now.toISOString(),
      locationLabel: input.destination.name,
      impact: `Best window today ~ ${pulse.bestWindowLabel}`,
      recommendation: pulse.verdict === 'Poor' || pulse.verdict === 'Moderate'
        ? 'Re-check conditions before committing your full afternoon.'
        : 'Conditions support starting soon if you are free.',
      action: 'RE_EVALUATE',
      actionLabel: 'Open destination',
      confidence: 68,
      source: 'estimated',
      icon: 'navigate-outline',
    });
  }

  const order: Record<IntelligencePriority, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  return events.sort((a, b) => order[a.priority] - order[b.priority]);
}

export function buildWhy(input: IntelligenceEngineInput): WhyBreakdown {
  const now = input.now ?? new Date();
  const w = input.weather;
  const mobility = estimateMobilityPressure(now);
  const crowd = estimateCrowdLevel(now, w?.rainProbability);
  const factors = [
    {
      key: 'weather',
      label: 'Weather',
      delta: w ? Math.round((weatherSuitability(w) - 50) / 3) : 0,
      reason: w ? w.description : 'Weather unavailable',
    },
    {
      key: 'travel',
      label: 'Travel time',
      delta: Math.round((mobility.score - 50) / 4),
      reason: mobility.label,
    },
    {
      key: 'crowd',
      label: 'Crowd',
      delta: Math.round((crowd.score - 50) / 5),
      reason: `${crowd.label} (estimated)`,
    },
    {
      key: 'air',
      label: 'Air quality',
      delta: w?.aqi != null ? Math.round((aqiScore(w.aqi) - 50) / 5) : 0,
      reason: w?.aqi != null ? `AQI ${w.aqi}` : 'AQI unavailable',
    },
    {
      key: 'budget',
      label: 'Budget fit',
      delta: input.prefs?.budget === 'low' ? 4 : 6,
      reason: input.prefs?.budget ? `Preference: ${input.prefs.budget}` : 'Default preference',
    },
    {
      key: 'distance',
      label: 'Distance',
      delta: input.destination?.distanceKm != null
        ? input.destination.distanceKm > 80
          ? -6
          : input.destination.distanceKm > 40
            ? -3
            : 4
        : 0,
      reason:
        input.destination?.distanceKm != null
          ? `~${input.destination.distanceKm.toFixed(0)} km`
          : 'No destination distance',
    },
  ];

  const base = input.destination?.matchScore ?? 78;
  const overall = Math.max(40, Math.min(98, base + factors.reduce((s, f) => s + f.delta, 0)));
  const name = input.destination?.name ?? 'your area';

  return {
    title: `Why ${name} now?`,
    overallScore: overall,
    factors,
    summary: `UrbanLens weighed live weather where available and clearly labeled estimates for traffic/crowd. Overall suitability ${overall}/100.`,
  };
}

export function buildIdealPlan(input: IntelligenceEngineInput): IdealPlan {
  const now = input.now ?? new Date();
  const leave = addMinutes(now, 15);
  const stop1 = addMinutes(leave, 25);
  const meal = addMinutes(stop1, 50);
  const stop2 = addMinutes(meal, 40);
  const ret = addMinutes(stop2, 35);
  const dest = input.destination?.name ?? 'a nearby highlight';
  const rain = input.weather?.rainProbability ?? 0;

  return {
    id: `plan-${now.toISOString()}`,
    title: 'Your ideal stretch',
    subtitle: 'Built from location, weather, and time estimates — refine before you go.',
    stops: [
      {
        id: 'leave',
        timeLabel: formatClock(leave),
        title: 'Leave',
        note: `From ${input.areaLabel || 'your location'}`,
        kind: 'leave',
        travelMinutesAfter: 25,
      },
      {
        id: 'stop1',
        timeLabel: formatClock(stop1),
        title: dest,
        note:
          rain >= 45
            ? 'Outdoor stop first — rain risk later'
            : 'Primary stop while conditions look favorable',
        kind: 'stop',
        travelMinutesAfter: 18,
      },
      {
        id: 'meal',
        timeLabel: formatClock(meal),
        title: 'Break / lunch',
        note: 'Buffer before secondary stop',
        kind: 'meal',
        travelMinutesAfter: 15,
      },
      {
        id: 'stop2',
        timeLabel: formatClock(stop2),
        title: 'Secondary stop',
        note: rain >= 45 ? 'Prefer covered / shorter outdoor' : 'Quieter follow-up (estimated)',
        kind: 'stop',
        travelMinutesAfter: 30,
      },
      {
        id: 'return',
        timeLabel: formatClock(ret),
        title: 'Return',
        note: 'Head back before evening congestion if possible',
        kind: 'return',
      },
    ],
    whySummary:
      rain >= 45
        ? 'Order prioritizes outdoor time before rising rain probability.'
        : 'Order balances daylight, estimated crowd, and a sensible return window.',
  };
}

export function buildDestinationPulse(input: IntelligenceEngineInput): DestinationPulse {
  const now = input.now ?? new Date();
  const w = input.weather;
  const mobility = estimateMobilityPressure(now);
  const crowd = estimateCrowdLevel(now, w?.rainProbability ?? input.destination?.rainProbability);
  const parking = estimateParking(now);
  const weatherScore = w ? weatherSuitability(w) : 60;
  const scoreNow = Math.round(
    weatherScore * 0.35 + crowd.score * 0.25 + mobility.score * 0.25 + parking.score * 0.15,
  );
  // Deterministic "since morning" delta from hour — not fabricated live history
  const morningBias = hourOf(now) < 12 ? 0 : Math.round((scoreNow - 70) / 3);
  const scoreDelta = morningBias;
  const verdict =
    scoreNow >= 80 ? 'Excellent' : scoreNow >= 65 ? 'Good' : scoreNow >= 50 ? 'Moderate' : 'Poor';

  const start = addMinutes(now, scoreNow >= 70 ? 20 : 60);
  const end = addMinutes(start, 110);

  return {
    verdict,
    verdictLine:
      scoreDelta > 0
        ? 'This destination looks more favorable now than earlier today (modelled from current signals).'
        : scoreDelta < 0
          ? 'Conditions look softer than the morning baseline for typical patterns.'
          : 'Conditions are broadly steady versus a typical morning baseline.',
    weather: w?.description ?? input.destination?.weatherLabel ?? 'Unknown',
    crowd: crowd.label,
    traffic: mobility.level,
    parking: parking.label.includes('limited') || parking.label.includes('tight')
      ? 'Limited'
      : 'Available',
    bestWindowStart: formatClock(start),
    bestWindowEnd: formatClock(end),
    bestWindowLabel: `${formatClock(start)} – ${formatClock(end)}`,
    scoreNow,
    scoreDelta,
    deltaLabel:
      scoreDelta > 0
        ? `↑ +${scoreDelta} vs morning baseline`
        : scoreDelta < 0
          ? `↓ ${scoreDelta} vs morning baseline`
          : '→ steady vs morning baseline',
    factors: [
      { label: 'Weather', value: weatherScore },
      { label: 'Crowd', value: crowd.score },
      { label: 'Visibility', value: Math.min(95, weatherScore + 5) },
      { label: 'Traffic', value: mobility.score },
    ],
  };
}

export function buildWhatChanged(
  input: IntelligenceEngineInput,
  prior?: WhatChangedSnapshot | null,
): WhatChangedSnapshot | null {
  if (!input.destination) return null;
  const pulse = buildDestinationPulse(input);
  const w = input.weather;

  const currentItems = [
    {
      key: 'weather',
      label: 'Weather',
      from: prior?.items.find((i) => i.key === 'weather')?.to ?? 'Clearer / drier',
      to: w?.description ?? pulse.weather,
      worse: (w?.rainProbability ?? 0) >= 45,
    },
    {
      key: 'crowd',
      label: 'Crowd',
      from: prior?.items.find((i) => i.key === 'crowd')?.to ?? 'Low',
      to: pulse.crowd,
      worse: pulse.crowd === 'Busier',
    },
    {
      key: 'traffic',
      label: 'Traffic',
      from: prior?.items.find((i) => i.key === 'traffic')?.to ?? 'Normal',
      to: pulse.traffic,
      worse: pulse.traffic === 'Heavy',
    },
    {
      key: 'parking',
      label: 'Parking',
      from: prior?.items.find((i) => i.key === 'parking')?.to ?? 'Available',
      to: pulse.parking,
      worse: pulse.parking === 'Limited',
    },
  ];

  const worseCount = currentItems.filter((i) => i.worse).length;
  return {
    destinationId: input.destination.id,
    destinationName: input.destination.name,
    items: currentItems,
    interpretation:
      worseCount >= 2
        ? 'Your previous plan may no longer be optimal given current signals.'
        : worseCount === 1
          ? 'One condition shifted — worth a quick re-check before you leave.'
          : 'No major deterioration versus the last snapshot UrbanLens stored.',
    capturedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function buildImpactFromEvents(events: IntelligenceEvent[]): IntelligenceImpact {
  const high = events.filter((e) => e.priority === 'HIGH' || e.priority === 'CRITICAL').length;
  const weather = events.some((e) => e.type === 'WEATHER_CHANGE');
  const mobility = events.some((e) => e.type === 'MOBILITY');
  const bullets: string[] = [];
  if (weather) bullets.push('Flagged rising rain risk early');
  if (mobility) bullets.push('Warned about estimated congestion windows');
  if (events.some((e) => e.type === 'CROWD_SHIFT')) bullets.push('Suggested quieter sequencing');
  if (events.some((e) => e.type === 'OPPORTUNITY')) bullets.push('Highlighted a favorable outdoor window');
  if (!bullets.length) bullets.push('Monitored available signals for your area');

  return {
    minutesSavedEst: mobility ? 11 : weather ? 8 : 0,
    routesAdjusted: mobility ? 1 : 0,
    conditionChanges: events.filter((e) => e.type !== 'SIGNAL_GAP').length,
    recommendationsAccepted: 0,
    bullets,
    reflection:
      high > 0
        ? 'UrbanLens surfaced higher-priority condition shifts so you could adapt before committing the full route.'
        : 'Conditions stayed relatively steady; UrbanLens kept a light watch on weather and time-based mobility.',
    minutesAreEstimate: true,
  };
}
