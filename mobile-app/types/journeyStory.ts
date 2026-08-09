export type JourneyTimelineStop = {
  id: string;
  title: string;
  time: string;
  duration: string;
  note: string;
  mood: string;
  imageUrl: string;
  kind: 'start' | 'stop' | 'poi' | 'destination';
};

export type JourneyHighlight = {
  id: string;
  title: string;
  description: string;
  badge: string;
  imageUrl: string;
  gradient: [string, string];
};

export type JourneyMemory = {
  id: string;
  imageUrl: string;
  caption: string;
  favorited?: boolean;
};

export type JourneyAchievement = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  unlocked: boolean;
};

export type JourneyScoreFactor = {
  key: string;
  label: string;
  score: number;
  reason: string;
};

export type JourneyEnvironmentPoint = {
  label: string;
  value: number;
  unit?: string;
};

export type JourneyStatistics = {
  distanceKm: number;
  travelMinutes: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  fuelLiters: number;
  fuelCostInr: number;
  parkingCostInr: number;
  tollsInr: number;
  /** Default/estimated budget before user answers */
  estimatedBudgetInr?: number;
  /** Real user spend (falls back to estimate when not provided) */
  totalBudgetInr: number;
  foodCostInr?: number;
  otherCostInr?: number;
  carbonKg: number;
  caloriesWalked: number;
  stopsMade: number;
};

export type JourneyStoryPayload = {
  id: string;
  destinationName: string;
  destinationId?: string;
  destinationImage: string;
  originName: string;
  completedAt: string;
  weatherLabel: string;
  narrative: string;
  statistics: JourneyStatistics;
  /** Calendar days for the trip (1–2 = weekend-style). Estimated from travel time if omitted. */
  tripDays?: number;
  timeline: JourneyTimelineStop[];
  highlights: JourneyHighlight[];
  memories: JourneyMemory[];
  environment: JourneyEnvironmentPoint[];
  travelScore: number;
  scoreFactors: JourneyScoreFactor[];
  achievements: JourneyAchievement[];
  routeCoordinates: { latitude: number; longitude: number }[];
  savedToVault?: boolean;
};

export type JourneyStorySeed = {
  destinationName: string;
  destinationId?: string;
  originName?: string;
  distanceKm?: number;
  durationMinutes?: number;
  weatherLabel?: string;
  destinationImage?: string;
  tripDays?: number;
  routeCoordinates?: { latitude: number; longitude: number }[];
  /** Default estimate (auto) before real user costs */
  estimatedBudgetInr?: number;
  /** Real totals from post-tour budget questions */
  actualTotalBudgetInr?: number;
  actualFuelCostInr?: number;
  actualFoodCostInr?: number;
  actualOtherCostInr?: number;
};
