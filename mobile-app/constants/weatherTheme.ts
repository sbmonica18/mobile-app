/**
 * Weather visual theme + climate engine mapping (Open-Meteo WMO codes).
 */

export function isDayTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

export function getDayPhase(): 'sunrise' | 'day' | 'sunset' | 'night' {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const t = hour + minute / 60;
  if (t >= 5 && t < 7) return 'sunrise';
  if (t >= 17 && t < 19) return 'sunset';
  if (t >= 6 && t < 18) return 'day';
  return 'night';
}

/** Legacy coarse condition (used across older helpers). */
export type WeatherCondition = 'clear' | 'partlyCloudy' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'windy';

/** Fine-grained climate scene for the animated weather card. */
export type ClimateState =
  | 'clearSunny'
  | 'partlyCloudy'
  | 'overcast'
  | 'lightRain'
  | 'heavyRain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'windy'
  | 'storm'
  | 'clearNight'
  | 'cloudyNight'
  | 'rainyNight'
  | 'sunrise'
  | 'sunset';

export type ClimateSceneConfig = {
  state: ClimateState;
  label: string;
  gradient: [string, string, string];
  ambient: string;
  ambientOpacity: number;
  accent: string;
  tempGlow: string;
  metricTint: string;
  icon: string;
  effects: {
    sun?: boolean;
    moon?: boolean;
    clouds?: 'light' | 'medium' | 'heavy';
    rain?: 'light' | 'heavy';
    snow?: boolean;
    fog?: boolean;
    wind?: boolean;
    stars?: boolean;
    lightning?: boolean;
    dust?: boolean;
    birds?: boolean;
    mist?: boolean;
  };
};

export function getConditionFromCode(code?: number | null): WeatherCondition {
  if (code == null) return 'cloudy';
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 95 && code <= 99) return 'storm';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  return 'cloudy';
}

export function getConditionFromDescription(description?: string | null): WeatherCondition {
  const d = (description ?? '').toLowerCase();
  if (!d) return 'cloudy';
  if (/(thunder|storm)/.test(d)) return 'storm';
  if (/fog|mist|haze/.test(d)) return 'fog';
  if (/snow|sleet|blizzard/.test(d)) return 'snow';
  if (/wind|breeze|gale/.test(d)) return 'windy';
  if (/(rain|drizzle|shower)/.test(d)) return 'rain';
  if (/(mainly clear|partly cloudy)/.test(d)) return 'partlyCloudy';
  if (/(clear|sunny)/.test(d)) return 'clear';
  if (/overcast|cloud/.test(d)) return 'cloudy';
  return 'cloudy';
}

export function resolveCondition(code?: number | null, description?: string | null): WeatherCondition {
  if (code != null) return getConditionFromCode(code);
  return getConditionFromDescription(description);
}

export function resolveClimateState(
  code?: number | null,
  description?: string | null,
  windKph?: number | null,
): ClimateState {
  const phase = getDayPhase();
  const condition = resolveCondition(code, description);
  const windy = (windKph ?? 0) >= 28 || condition === 'windy';
  const d = (description ?? '').toLowerCase();
  const heavyRain =
    /heavy|torrential|downpour/.test(d) ||
    (code != null && ((code >= 63 && code <= 67) || (code >= 81 && code <= 82)));

  // Time-of-day scenic overrides for clear / partly cloudy
  if ((condition === 'clear' || condition === 'partlyCloudy') && phase === 'sunrise') {
    return 'sunrise';
  }
  if ((condition === 'clear' || condition === 'partlyCloudy') && phase === 'sunset') {
    return 'sunset';
  }

  if (condition === 'storm' || (code != null && code >= 95)) {
    return code != null && code >= 96 ? 'storm' : 'thunderstorm';
  }

  if (condition === 'snow') return 'snow';
  if (condition === 'fog') return 'fog';

  if (condition === 'rain') {
    if (phase === 'night') return 'rainyNight';
    return heavyRain ? 'heavyRain' : 'lightRain';
  }

  if (windy && (condition === 'clear' || condition === 'partlyCloudy' || condition === 'cloudy')) {
    return 'windy';
  }

  if (condition === 'clear') {
    return phase === 'night' ? 'clearNight' : 'clearSunny';
  }

  if (condition === 'partlyCloudy') {
    return phase === 'night' ? 'cloudyNight' : 'partlyCloudy';
  }

  // overcast / cloudy
  if (phase === 'night') return 'cloudyNight';
  return 'overcast';
}

const SCENES: Record<ClimateState, Omit<ClimateSceneConfig, 'state'>> = {
  clearSunny: {
    label: 'Clear',
    gradient: ['#4FA3FF', '#87CEFA', '#DCEEFF'],
    ambient: '#FBBF24',
    ambientOpacity: 0.09,
    accent: '#FBBF24',
    tempGlow: 'rgba(255,255,255,0.35)',
    metricTint: 'rgba(255,255,255,0.18)',
    icon: 'sunny',
    effects: { sun: true, clouds: 'light', dust: true },
  },
  partlyCloudy: {
    label: 'Partly Cloudy',
    gradient: ['#5BA8F5', '#8EC5F7', '#E8F4FF'],
    ambient: '#FDE68A',
    ambientOpacity: 0.07,
    accent: '#FBBF24',
    tempGlow: 'rgba(255,255,255,0.28)',
    metricTint: 'rgba(255,255,255,0.16)',
    icon: 'partly-sunny',
    effects: { sun: true, clouds: 'medium' },
  },
  overcast: {
    label: 'Overcast',
    gradient: ['#374151', '#4B5563', '#6B7280'],
    ambient: '#94A3B8',
    ambientOpacity: 0.05,
    accent: '#E2E8F0',
    tempGlow: 'rgba(255,255,255,0.12)',
    metricTint: 'rgba(255,255,255,0.12)',
    icon: 'cloudy',
    effects: { clouds: 'heavy', fog: true, mist: true },
  },
  lightRain: {
    label: 'Light Rain',
    gradient: ['#475569', '#64748B', '#94A3B8'],
    ambient: '#60A5FA',
    ambientOpacity: 0.08,
    accent: '#93C5FD',
    tempGlow: 'rgba(147,197,253,0.25)',
    metricTint: 'rgba(96,165,250,0.16)',
    icon: 'rainy',
    effects: { rain: 'light', clouds: 'medium', mist: true },
  },
  heavyRain: {
    label: 'Heavy Rain',
    gradient: ['#0F172A', '#1E3A5F', '#334155'],
    ambient: '#3B82F6',
    ambientOpacity: 0.1,
    accent: '#93C5FD',
    tempGlow: 'rgba(147,197,253,0.3)',
    metricTint: 'rgba(59,130,246,0.18)',
    icon: 'rainy',
    effects: { rain: 'heavy', clouds: 'heavy', mist: true },
  },
  thunderstorm: {
    label: 'Thunderstorm',
    gradient: ['#020617', '#0F172A', '#1E293B'],
    ambient: '#A78BFA',
    ambientOpacity: 0.08,
    accent: '#C4B5FD',
    tempGlow: 'rgba(196,181,253,0.28)',
    metricTint: 'rgba(167,139,250,0.16)',
    icon: 'thunderstorm',
    effects: { rain: 'heavy', clouds: 'heavy', lightning: true },
  },
  snow: {
    label: 'Snow',
    gradient: ['#1E3A5F', '#334155', '#94A3B8'],
    ambient: '#E0F2FE',
    ambientOpacity: 0.1,
    accent: '#E0F2FE',
    tempGlow: 'rgba(224,242,254,0.35)',
    metricTint: 'rgba(224,242,254,0.14)',
    icon: 'snow',
    effects: { snow: true, fog: true, mist: true },
  },
  fog: {
    label: 'Fog',
    gradient: ['#6B7280', '#9CA3AF', '#D1D5DB'],
    ambient: '#F8FAFC',
    ambientOpacity: 0.12,
    accent: '#F1F5F9',
    tempGlow: 'rgba(255,255,255,0.2)',
    metricTint: 'rgba(255,255,255,0.2)',
    icon: 'cloud',
    effects: { fog: true, mist: true },
  },
  windy: {
    label: 'Windy',
    gradient: ['#38BDF8', '#7DD3FC', '#E0F2FE'],
    ambient: '#BAE6FD',
    ambientOpacity: 0.07,
    accent: '#E0F2FE',
    tempGlow: 'rgba(255,255,255,0.25)',
    metricTint: 'rgba(255,255,255,0.16)',
    icon: 'flag',
    effects: { wind: true, clouds: 'light', dust: true },
  },
  storm: {
    label: 'Storm',
    gradient: ['#020617', '#0B1220', '#111827'],
    ambient: '#6366F1',
    ambientOpacity: 0.1,
    accent: '#A5B4FC',
    tempGlow: 'rgba(165,180,252,0.3)',
    metricTint: 'rgba(99,102,241,0.16)',
    icon: 'thunderstorm',
    effects: { rain: 'heavy', wind: true, clouds: 'heavy', lightning: true, dust: true },
  },
  clearNight: {
    label: 'Clear Night',
    gradient: ['#0F172A', '#1E293B', '#312E81'],
    ambient: '#818CF8',
    ambientOpacity: 0.08,
    accent: '#FDE047',
    tempGlow: 'rgba(226,232,240,0.28)',
    metricTint: 'rgba(255,255,255,0.12)',
    icon: 'moon',
    effects: { moon: true, stars: true, clouds: 'light' },
  },
  cloudyNight: {
    label: 'Cloudy Night',
    gradient: ['#0F172A', '#1E293B', '#334155'],
    ambient: '#64748B',
    ambientOpacity: 0.06,
    accent: '#E2E8F0',
    tempGlow: 'rgba(226,232,240,0.18)',
    metricTint: 'rgba(255,255,255,0.1)',
    icon: 'cloudy-night',
    effects: { moon: true, stars: true, clouds: 'heavy', fog: true },
  },
  rainyNight: {
    label: 'Rainy Night',
    gradient: ['#020617', '#0F172A', '#1E3A5F'],
    ambient: '#3B82F6',
    ambientOpacity: 0.09,
    accent: '#93C5FD',
    tempGlow: 'rgba(147,197,253,0.25)',
    metricTint: 'rgba(59,130,246,0.14)',
    icon: 'rainy',
    effects: { rain: 'light', clouds: 'heavy', mist: true },
  },
  sunrise: {
    label: 'Sunrise',
    gradient: ['#FB923C', '#F472B6', '#818CF8'],
    ambient: '#FDBA74',
    ambientOpacity: 0.12,
    accent: '#FEF3C7',
    tempGlow: 'rgba(254,243,199,0.35)',
    metricTint: 'rgba(255,255,255,0.16)',
    icon: 'sunny',
    effects: { sun: true, clouds: 'light', birds: true },
  },
  sunset: {
    label: 'Sunset',
    gradient: ['#EA580C', '#DB2777', '#7C3AED'],
    ambient: '#FB923C',
    ambientOpacity: 0.12,
    accent: '#FDE68A',
    tempGlow: 'rgba(253,230,138,0.35)',
    metricTint: 'rgba(255,255,255,0.16)',
    icon: 'sunny',
    effects: { sun: true, clouds: 'medium', birds: true },
  },
};

export function getClimateScene(
  code?: number | null,
  description?: string | null,
  windKph?: number | null,
): ClimateSceneConfig {
  const state = resolveClimateState(code, description, windKph);
  return { state, ...SCENES[state] };
}

export function getWeatherIcon(condition: WeatherCondition, isDay: boolean) {
  switch (condition) {
    case 'clear':
      return isDay ? 'sunny' : 'moon';
    case 'partlyCloudy':
      return isDay ? 'partly-sunny' : 'cloudy-night';
    case 'cloudy':
      return 'cloudy';
    case 'rain':
      return 'rainy';
    case 'storm':
      return 'thunderstorm';
    case 'snow':
      return 'snow';
    case 'fog':
      return 'cloud';
    case 'windy':
      return 'flag';
    default:
      return 'cloudy';
  }
}

export function getWeatherGradient(condition: WeatherCondition, isDay: boolean): string[] {
  switch (condition) {
    case 'clear':
      return isDay ? ['#4FA3FF', '#87CEFA', '#DCEEFF'] : ['#0F172A', '#1E293B', '#312E81'];
    case 'partlyCloudy':
      return isDay ? ['#5BA8F5', '#8EC5F7', '#E8F4FF'] : ['#0F172A', '#1E293B', '#334155'];
    case 'cloudy':
      return ['#374151', '#4B5563', '#6B7280'];
    case 'rain':
      return ['#475569', '#64748B', '#94A3B8'];
    case 'storm':
      return ['#020617', '#0F172A', '#1E293B'];
    case 'snow':
      return ['#1E3A5F', '#334155', '#94A3B8'];
    case 'fog':
      return ['#6B7280', '#9CA3AF', '#D1D5DB'];
    case 'windy':
      return ['#38BDF8', '#7DD3FC', '#E0F2FE'];
    default:
      return ['#374151', '#4B5563', '#6B7280'];
  }
}

export function getWeatherAccent(condition: WeatherCondition, isDay: boolean): string {
  if (condition === 'clear') return isDay ? '#FBBF24' : '#FDE047';
  if (condition === 'partlyCloudy') return isDay ? '#FBBF24' : '#E2E8F0';
  if (condition === 'cloudy') return '#CBD5E1';
  if (condition === 'rain') return '#93C5FD';
  if (condition === 'storm') return '#A78BFA';
  if (condition === 'snow') return '#E0F2FE';
  if (condition === 'fog') return '#F1F5F9';
  if (condition === 'windy') return '#E0F2FE';
  return '#CBD5E1';
}
