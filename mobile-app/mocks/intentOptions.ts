export const MOODS = ['Relax', 'Active', 'Explore', 'Unwind'] as const;
export const BUDGETS = ['₹1000', '₹3000', '₹5000+', 'Flexible'] as const;
export const TIME_OPTIONS = ['2 Hours', 'Half Day', 'One Day', 'Multi-day'] as const;
export const TRAVEL_STYLES = ['Solo', 'Friends', 'Family', 'Group'] as const;
export const TRANSPORT_MODES = ['Car', 'Bike', 'Public Transport', 'Walk'] as const;
export const PRIORITIES = ['Weather', 'Air quality', 'Traffic', 'Budget'] as const;

export type Mood = (typeof MOODS)[number];
export type Budget = (typeof BUDGETS)[number];
export type TimeOption = (typeof TIME_OPTIONS)[number];
export type TravelStyle = (typeof TRAVEL_STYLES)[number];
export type TransportMode = (typeof TRANSPORT_MODES)[number];
export type Priority = (typeof PRIORITIES)[number];

export type IntentFilters = {
  mood?: Mood | string | null;
  budget?: Budget | string | null;
  time?: TimeOption | string | null;
  travelStyle?: TravelStyle | string | null;
  transportMode?: TransportMode | string | null;
  priority?: Priority | string | null;
  phrase?: string | null;
};

export const EXPERIENCE_TEASERS = [
  { key: 'nature', label: 'Nature Escape', subtitle: 'Calm green escapes', mood: 'Relax' as Mood },
  { key: 'scenic', label: 'Scenic Drive', subtitle: 'Views on the road', mood: 'Explore' as Mood },
  { key: 'photo', label: 'Photography', subtitle: 'Golden hour spots', mood: 'Explore' as Mood },
  { key: 'food', label: 'Food Trail', subtitle: 'Local flavours', mood: 'Active' as Mood },
  { key: 'hidden', label: 'Hidden Gems', subtitle: 'Offbeat places', mood: 'Unwind' as Mood },
] as const;

export const MOOD_ICONS: Record<Mood, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  Relax: 'leaf-outline',
  Active: 'bicycle-outline',
  Explore: 'compass-outline',
  Unwind: 'water-outline',
};
