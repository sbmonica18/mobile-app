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

export type JourneyMode = 'car' | 'flight' | 'train' | 'bus';

export type ModeQuote = {
  mode: JourneyMode;
  label: string;
  available: boolean;
  reason?: string;
  durationMin: number;
  transportCost: number;
  cards: { label: string; value: string }[];
};

export type JourneyPlan = {
  recommended: JourneyMode;
  modes: ModeQuote[];
  stay: number;
  food: number;
  local: number;
  groundTotal: number;
};

const PETROL_PER_L = 102;
const CAR_KMPL = 13;
const TOLL_PER_KM = 2.1;
const TRAIN_PER_KM = 1.85;
const BUS_PER_LKM = 2.4;

const METRO_AIRPORTS: Array<{ code: string; name: string; lat: number; lon: number }> = [
  { code: 'MAA', name: 'Chennai', lat: 12.994, lon: 80.171 },
  { code: 'BLR', name: 'Bengaluru', lat: 13.198, lon: 77.706 },
  { code: 'HYD', name: 'Hyderabad', lat: 17.24, lon: 78.43 },
  { code: 'BOM', name: 'Mumbai', lat: 19.089, lon: 72.868 },
  { code: 'DEL', name: 'Delhi', lat: 28.556, lon: 77.1 },
  { code: 'CCU', name: 'Kolkata', lat: 22.655, lon: 88.447 },
  { code: 'COK', name: 'Kochi', lat: 10.152, lon: 76.401 },
  { code: 'GOI', name: 'Goa', lat: 15.381, lon: 73.831 },
  { code: 'PNQ', name: 'Pune', lat: 18.582, lon: 73.92 },
  { code: 'AMD', name: 'Ahmedabad', lat: 23.077, lon: 72.635 },
  { code: 'JAI', name: 'Jaipur', lat: 26.824, lon: 75.812 },
  { code: 'CJB', name: 'Coimbatore', lat: 11.03, lon: 77.043 },
  { code: 'TRZ', name: 'Tiruchirappalli', lat: 10.765, lon: 78.71 },
  { code: 'IXM', name: 'Madurai', lat: 9.835, lon: 78.089 },
  { code: 'VGA', name: 'Vijayawada', lat: 16.53, lon: 80.797 },
];

/** Dest id → nearest useful airport. extraKm = road from airport to town. */
const DEST_AIRPORT: Record<string, { code: string; extraKm: number } | null> = {
  delhi: { code: 'DEL', extraKm: 20 },
  agra: { code: 'DEL', extraKm: 230 },
  jaipur: { code: 'JAI', extraKm: 15 },
  goa: { code: 'GOI', extraKm: 30 },
  mumbai: { code: 'BOM', extraKm: 22 },
  varanasi: { code: 'VNS', extraKm: 25 },
  haridwar: { code: 'DED', extraKm: 40 },
  rishikesh: { code: 'DED', extraKm: 55 },
  manali: { code: 'KUU', extraKm: 50 },
  shimla: { code: 'SLV', extraKm: 25 },
  udaipur: { code: 'UDR', extraKm: 25 },
  jodhpur: { code: 'JDH', extraKm: 8 },
  jaisalmer: { code: 'JSA', extraKm: 15 },
  amritsar: { code: 'ATQ', extraKm: 12 },
  bangalore: { code: 'BLR', extraKm: 35 },
  mysore: { code: 'MYQ', extraKm: 12 },
  ooty: { code: 'CJB', extraKm: 90 },
  munnar: { code: 'COK', extraKm: 110 },
  kochi: { code: 'COK', extraKm: 30 },
  alleppey: { code: 'COK', extraKm: 85 },
  darjeeling: { code: 'IXB', extraKm: 70 },
  gangtok: { code: 'IXB', extraKm: 125 },
  nainital: { code: 'DED', extraKm: 140 },
  mussoorie: { code: 'DED', extraKm: 55 },
  leh: { code: 'IXL', extraKm: 8 },
  shirdi: { code: 'SAG', extraKm: 15 },
  tirupati: { code: 'TIR', extraKm: 15 },
  'vaishno-devi': { code: 'IXJ', extraKm: 50 },
  'bodh-gaya': { code: 'GAY', extraKm: 10 },
  puri: { code: 'BBI', extraKm: 60 },
  khajuraho: { code: 'HJR', extraKm: 8 },
  hampi: { code: 'HBX', extraKm: 60 },
  'ajanta-ellora': { code: 'IXU', extraKm: 100 },
  kolkata: { code: 'CCU', extraKm: 18 },
  chennai: { code: 'MAA', extraKm: 18 },
  hyderabad: { code: 'HYD', extraKm: 25 },
  pondicherry: { code: 'PNY', extraKm: 8 },
  kovalam: { code: 'TRV', extraKm: 16 },
  andaman: { code: 'IXZ', extraKm: 5 },
  'mount-abu': { code: 'UDR', extraKm: 165 },
  pushkar: { code: 'JAI', extraKm: 145 },
  dwarka: { code: 'JGA', extraKm: 130 },
  rameswaram: { code: 'IXM', extraKm: 175 },
  madurai: { code: 'IXM', extraKm: 12 },
  coorg: { code: 'IXE', extraKm: 140 },
  wayanad: { code: 'CCJ', extraKm: 110 },
  kodaikanal: { code: 'IXM', extraKm: 120 },
  mahabaleshwar: { code: 'PNQ', extraKm: 120 },
  'rann-of-kutch': { code: 'BHJ', extraKm: 80 },
  ranthambore: { code: 'JAI', extraKm: 180 },
};

const NO_RAIL = new Set(['andaman', 'leh', 'munnar', 'kodaikanal', 'wayanad']);
const NO_ROAD_FROM_MAINLAND = new Set(['andaman']);

function clamp(n: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, n)));
}

function nearestAirport(lat: number, lon: number) {
  let best = METRO_AIRPORTS[0];
  let bestD = Infinity;
  for (const a of METRO_AIRPORTS) {
    const d = haversineKm(lat, lon, a.lat, a.lon);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return { ...best, km: bestD };
}

function groundCosts(tier: string | undefined) {
  if (tier === 'Premium') return { stay: 5200, food: 1600, local: 900 };
  if (tier === 'Budget Friendly') return { stay: 1800, food: 750, local: 400 };
  return { stay: 3000, food: 1100, local: 650 };
}

function pickRecommended(modes: ModeQuote[], roadKm: number, hint?: string | null): JourneyMode {
  const avail = (m: JourneyMode) => modes.find((x) => x.mode === m)?.available;
  const h = (hint || '').toLowerCase();
  if (h.includes('walk') && roadKm <= 8 && avail('car')) return 'car';
  if (h.includes('bike') && avail('car') && roadKm < 400) return 'car';
  if (h.includes('car') && avail('car')) return 'car';
  if (h.includes('public')) {
    if (avail('train')) return 'train';
    if (avail('bus')) return 'bus';
    if (avail('flight')) return 'flight';
  }
  if (!avail('car') && avail('flight')) return 'flight';
  if (roadKm < 90 && avail('car')) return 'car';
  if (roadKm < 420) {
    if (avail('bus')) return 'bus';
    if (avail('train')) return 'train';
    if (avail('car')) return 'car';
  }
  if (roadKm < 750) {
    if (avail('train')) return 'train';
    if (avail('flight') && roadKm > 550) return 'flight';
    if (avail('bus')) return 'bus';
    if (avail('car')) return 'car';
  }
  if (avail('flight')) return 'flight';
  if (avail('train')) return 'train';
  if (avail('car')) return 'car';
  return (modes.find((m) => m.available)?.mode || 'car') as JourneyMode;
}

export function estimateJourney(opts: {
  destId: string;
  roadKm: number;
  origin?: { latitude: number; longitude: number } | null;
  dest?: { latitude: number; longitude: number } | null;
  tier?: string;
  hint?: string | null;
}): JourneyPlan {
  const roadKm = Math.max(1, opts.roadKm || 1);
  const island = NO_ROAD_FROM_MAINLAND.has(opts.destId);
  const destAir = DEST_AIRPORT[opts.destId];
  const originAir =
    opts.origin?.latitude != null
      ? nearestAirport(opts.origin.latitude, opts.origin.longitude)
      : null;
  const sameAirport = !!(originAir && destAir && originAir.code === destAir.code);

  const carFuel = clamp((roadKm / CAR_KMPL) * PETROL_PER_L, 80, 28000);
  const carToll = island ? 0 : clamp(roadKm * TOLL_PER_KM, 0, 4500);
  const carTime = Math.max(5, Math.round((roadKm / avgSpeedKmh(roadKm)) * 60));
  const car: ModeQuote = island
    ? {
        mode: 'car',
        label: 'Car',
        available: false,
        reason: 'No road from the mainland — fly to Port Blair, then local cabs.',
        durationMin: 0,
        transportCost: 0,
        cards: [],
      }
    : {
        mode: 'car',
        label: 'Car',
        available: true,
        durationMin: carTime,
        transportCost: carFuel + carToll,
        cards: [
          { label: 'Fuel', value: `₹${carFuel}` },
          { label: 'Tolls', value: `₹${carToll}` },
        ],
      };

  const airKm = opts.origin && opts.dest
    ? haversineKm(opts.origin.latitude, opts.origin.longitude, opts.dest.latitude, opts.dest.longitude)
    : roadKm / 1.35;
  const flightTime = Math.round((airKm / 740) * 60 + 150);
  const flightFare = clamp(2800 + airKm * 4.4 + (destAir?.extraKm || 0) * 8, 3200, 18500);
  let flight: ModeQuote;
  if (!destAir || !originAir) {
    flight = {
      mode: 'flight',
      label: 'Flight',
      available: false,
      reason: 'Need your location to estimate a real flight.',
      durationMin: 0,
      transportCost: 0,
      cards: [],
    };
  } else if (sameAirport && (destAir.extraKm || 0) < 80) {
    flight = {
      mode: 'flight',
      label: 'Flight',
      available: false,
      reason: `You are already in the ${originAir.name} airport region — fly only if going much farther.`,
      durationMin: 0,
      transportCost: 0,
      cards: [],
    };
  } else {
    flight = {
      mode: 'flight',
      label: 'Flight',
      available: true,
      durationMin: flightTime,
      transportCost: flightFare,
      cards: [
        { label: 'Ticket', value: `₹${flightFare}` },
        { label: 'Airport hop', value: destAir.extraKm ? `${destAir.extraKm} km local` : 'In town' },
      ],
    };
  }

  const trainTime = Math.round((roadKm / 50) * 60 + 40);
  const trainFare = clamp(180 + roadKm * TRAIN_PER_KM, 250, 4800);
  const train: ModeQuote = NO_RAIL.has(opts.destId) || island
    ? {
        mode: 'train',
        label: 'Train',
        available: false,
        reason: island
          ? 'No railway to the islands.'
          : opts.destId === 'leh'
            ? 'Leh has no passenger railway — fly or road via Manali/Srinagar.'
            : 'No useful direct train. Reach the nearest junction, then bus/taxi.',
        durationMin: 0,
        transportCost: 0,
        cards: [],
      }
    : {
        mode: 'train',
        label: 'Train',
        available: true,
        durationMin: trainTime,
        transportCost: trainFare,
        cards: [
          { label: 'Ticket (3A / SL mix)', value: `₹${trainFare}` },
          { label: 'Onboard time', value: formatTravelTime(trainTime) },
        ],
      };

  const busOk = !island && !NO_RAIL.has(opts.destId) && roadKm <= 700 && opts.destId !== 'leh';
  // Hill towns without rail can still have buses (munnar, kodai, wayanad)
  const hillBus = ['munnar', 'kodaikanal', 'wayanad', 'ooty', 'coorg'].includes(opts.destId) && roadKm <= 700;
  const busAvailable = !island && opts.destId !== 'leh' && (busOk || hillBus) && roadKm <= 700;
  const busTime = Math.round((roadKm / 42) * 60 + 30);
  const busFare = clamp(220 + roadKm * BUS_PER_LKM, 180, 2800);
  const bus: ModeQuote = busAvailable
    ? {
        mode: 'bus',
        label: 'Bus',
        available: true,
        durationMin: busTime,
        transportCost: busFare,
        cards: [
          { label: 'Volvo / sleeper', value: `₹${busFare}` },
          { label: 'On-road time', value: formatTravelTime(busTime) },
        ],
      }
    : {
        mode: 'bus',
        label: 'Bus',
        available: false,
        reason: island
          ? 'No bus from the mainland.'
          : opts.destId === 'leh'
            ? 'No practical bus from this far — fly to Leh.'
            : roadKm > 700
              ? 'No useful direct bus on this long hop. Prefer flight or train, then a local bus.'
              : 'Direct bus is unreliable on this route.',
        durationMin: 0,
        transportCost: 0,
        cards: [],
      };

  const modes = [car, flight, train, bus];
  const recommended = pickRecommended(modes, roadKm, opts.hint);
  const ground = groundCosts(opts.tier);
  return {
    recommended,
    modes,
    stay: ground.stay,
    food: ground.food,
    local: ground.local,
    groundTotal: ground.stay + ground.food + ground.local,
  };
}

export function journeyTotal(plan: JourneyPlan, mode: JourneyMode): number {
  const quote = plan.modes.find((m) => m.mode === mode);
  if (!quote?.available) return plan.groundTotal;
  return quote.transportCost + plan.groundTotal;
}
