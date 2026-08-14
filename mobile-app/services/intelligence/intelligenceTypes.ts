/** Phase 11 — UrbanLens Now intelligence model */

export type IntelligencePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IntelligenceEventType =
  | 'WEATHER_CHANGE'
  | 'CROWD_SHIFT'
  | 'MOBILITY'
  | 'PARKING'
  | 'AQI'
  | 'DESTINATION_WINDOW'
  | 'OPPORTUNITY'
  | 'ROUTE_ALERT'
  | 'SIGNAL_GAP';

export type SignalAvailability = 'available' | 'estimated' | 'unavailable';

export type IntelligenceSignalKey =
  | 'weather'
  | 'location'
  | 'aqi'
  | 'uv'
  | 'rain'
  | 'traffic'
  | 'crowd'
  | 'parking'
  | 'roads'
  | 'destination';

export type IntelligenceSignal = {
  key: IntelligenceSignalKey;
  label: string;
  status: SignalAvailability;
  valueLabel: string;
  score?: number; // 0–100 when known
};

export type IntelligenceActionKind =
  | 'OPEN_NOW'
  | 'ADJUST_PLAN'
  | 'EXPLORE_ALTERNATIVE'
  | 'REVIEW_ROUTE'
  | 'GO_NOW'
  | 'BUILD_PLAN'
  | 'RE_EVALUATE'
  | 'START_JOURNEY'
  | 'NONE';

export type IntelligenceEvent = {
  id: string;
  type: IntelligenceEventType;
  priority: IntelligencePriority;
  title: string;
  description: string;
  timestamp: string;
  locationLabel?: string;
  impact: string;
  recommendation: string;
  action: IntelligenceActionKind;
  actionLabel: string;
  confidence: number; // 0–100
  source: 'live' | 'estimated' | 'cached' | 'partial';
  icon: string;
};

export type ScoreFactor = {
  key: string;
  label: string;
  delta: number;
  reason: string;
};

export type WhyBreakdown = {
  title: string;
  overallScore: number;
  factors: ScoreFactor[];
  summary: string;
};

export type IdealPlanStop = {
  id: string;
  timeLabel: string;
  title: string;
  note: string;
  kind: 'leave' | 'stop' | 'meal' | 'return';
  travelMinutesAfter?: number;
};

export type IdealPlan = {
  id: string;
  title: string;
  subtitle: string;
  stops: IdealPlanStop[];
  whySummary: string;
};

export type DestinationPulse = {
  verdict: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  verdictLine: string;
  weather: string;
  crowd: string;
  traffic: string;
  parking: string;
  bestWindowStart: string;
  bestWindowEnd: string;
  bestWindowLabel: string;
  scoreNow: number;
  scoreDelta: number;
  deltaLabel: string;
  factors: { label: string; value: number }[];
};

export type WhatChangedItem = {
  key: string;
  label: string;
  from: string;
  to: string;
  worse: boolean;
};

export type WhatChangedSnapshot = {
  destinationId: string;
  destinationName: string;
  items: WhatChangedItem[];
  interpretation: string;
  capturedAt: string;
};

export type IntelligenceImpact = {
  minutesSavedEst: number;
  routesAdjusted: number;
  conditionChanges: number;
  recommendationsAccepted: number;
  bullets: string[];
  reflection: string;
  /** Only true when minutesSavedEst came from a real route delta */
  minutesAreEstimate: boolean;
};

export type IntelligenceSnapshot = {
  updatedAt: string;
  areaLabel: string;
  signalsAnalyzed: number;
  signals: IntelligenceSignal[];
  events: IntelligenceEvent[];
  opportunities: IntelligenceEvent[];
  headline: string;
  primaryEventId: string | null;
  why: WhyBreakdown | null;
  idealPlan: IdealPlan | null;
  pulse: DestinationPulse | null;
  whatChanged: WhatChangedSnapshot | null;
  impact: IntelligenceImpact | null;
};

export type IntelligenceEngineInput = {
  latitude?: number | null;
  longitude?: number | null;
  areaLabel?: string | null;
  weather?: {
    temperatureC: number;
    humidity: number;
    windKph: number;
    description: string;
    code: number;
    aqi?: number;
    uvIndex?: number;
    rainProbability?: number;
  } | null;
  destination?: {
    id: string;
    name: string;
    matchScore?: number;
    distanceKm?: number;
    travelTimeMin?: number;
    crowdLevel?: string;
    parkingAvailability?: string;
    rainProbability?: number;
    weatherLabel?: string;
    tempC?: number;
  } | null;
  /** Snapshot from a previous visit / save — for What Changed */
  priorSnapshot?: WhatChangedSnapshot | null;
  journeyActive?: boolean;
  prefs?: {
    budget?: string;
    mood?: string;
    availableHours?: number;
  } | null;
  now?: Date;
};
