import { CLOUD } from '@/constants/cloudTheme';

export type AppearanceId = 'light' | 'dark' | 'advanced';

export type AppColors = {
  bg: string;
  card: string;
  primary: string;
  primaryHover: string;
  lightBlue: string;
  accent: string;
  aiAccent: string;
  ink: string;
  body: string;
  muted: string;
  border: string;
  soft: string;
  success: string;
  warning: string;
  danger: string;
  statusBar: 'light' | 'dark';
  ambient: boolean;
  weatherTone: 'cloud' | 'cinematic';
};

const light: AppColors = {
  bg: CLOUD.bg,
  card: CLOUD.card,
  primary: CLOUD.primary,
  primaryHover: CLOUD.primaryHover,
  lightBlue: CLOUD.lightBlue,
  accent: CLOUD.accent,
  aiAccent: CLOUD.aiAccent,
  ink: CLOUD.ink,
  body: CLOUD.body,
  muted: CLOUD.muted,
  border: CLOUD.border,
  soft: CLOUD.soft,
  success: CLOUD.success,
  warning: CLOUD.warning,
  danger: CLOUD.danger,
  statusBar: 'dark',
  ambient: false,
  weatherTone: 'cloud',
};

const advanced: AppColors = {
  ...light,
  bg: '#EEF2FF',
  lightBlue: '#E0E7FF',
  ambient: true,
  weatherTone: 'cloud',
};

const dark: AppColors = {
  bg: '#0B1220',
  card: '#151E32',
  primary: '#60A5FA',
  primaryHover: '#3B82F6',
  lightBlue: '#1E3A5F',
  accent: '#2DD4BF',
  aiAccent: '#A78BFA',
  ink: '#F8FAFC',
  body: '#E2E8F0',
  muted: '#94A3B8',
  border: '#2A3654',
  soft: '#1C2740',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  statusBar: 'light',
  ambient: false,
  weatherTone: 'cloud',
};

export const APP_THEMES: Record<AppearanceId, AppColors> = {
  light,
  dark,
  advanced,
};

export const APPEARANCE_OPTIONS: Array<{
  id: AppearanceId;
  title: string;
  subtitle: string;
  icon: 'sunny-outline' | 'moon-outline' | 'sparkles-outline';
}> = [
  {
    id: 'light',
    title: 'Light',
    subtitle: 'Clean Cloud White',
    icon: 'sunny-outline',
  },
  {
    id: 'dark',
    title: 'Dark',
    subtitle: 'Night slate',
    icon: 'moon-outline',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: 'Cloud Intelligence',
    icon: 'sparkles-outline',
  },
];
