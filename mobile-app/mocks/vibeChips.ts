import type { Destination } from '@/mocks/destinations';
import { getRecommendations, mockDestinations } from '@/mocks/destinations';

export type VibeChip = {
  id: string;
  label: string;
  emoji: string;
  /** Natural-language prompt inserted into Ask anything */
  prompt: string;
  tags: string[];
  styles?: string[];
  alternatives?: string[];
};

/** Tap-to-fill prompt suggestions for the AI composer. */
export const VIBE_CHIPS: VibeChip[] = [
  {
    id: 'pilgrimage',
    label: 'Pilgrimage',
    emoji: '🙏',
    prompt: 'Suggest sacred pilgrimage and spiritual destinations',
    tags: ['pilgrimage', 'spiritual', 'culture'],
  },
  {
    id: 'heritage',
    label: 'Heritage',
    emoji: '🏛',
    prompt: 'Show me heritage forts, palaces and monument destinations',
    tags: ['heritage', 'architecture', 'culture'],
  },
  {
    id: 'metro',
    label: 'City Break',
    emoji: '🌆',
    prompt: 'Plan a metro city break with food and culture',
    tags: ['metro', 'urban', 'food', 'culture'],
  },
  {
    id: 'weekend',
    label: 'Weekend Escape',
    emoji: '🌿',
    prompt: 'Plan a peaceful weekend escape nearby',
    tags: ['weekend', 'nature', 'hills'],
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🏔',
    prompt: 'Show me nature destinations with great weather',
    tags: ['nature', 'forest', 'wildlife', 'lake'],
  },
  {
    id: 'beach',
    label: 'Beach',
    emoji: '🏖',
    prompt: 'Best beach and coastal destinations',
    tags: ['beach', 'coastal', 'scenic'],
  },
  {
    id: 'road',
    label: 'Road Trip',
    emoji: '🚗',
    prompt: 'Suggest a scenic road trip under 8 hours',
    tags: ['drive', 'ghats', 'scenic', 'road'],
  },
  {
    id: 'mountains',
    label: 'Mountains',
    emoji: '🏔',
    prompt: 'Best mountain destinations for this weekend',
    tags: ['hills', 'mountains', 'views', 'scenic'],
  },
  {
    id: 'adventure',
    label: 'Adventure',
    emoji: '🏕',
    prompt: 'Plan an adventure trip with trekking or outdoors',
    tags: ['adventure', 'trekking', 'mountains', 'hills'],
  },
  {
    id: 'wildlife',
    label: 'Wildlife',
    emoji: '🐯',
    prompt: 'Wildlife safari and nature reserve destinations',
    tags: ['wildlife', 'nature', 'forest'],
  },
  {
    id: 'photography',
    label: 'Photography',
    emoji: '📷',
    prompt: 'Best destinations for photography today',
    tags: ['photo', 'views', 'scenic', 'heritage'],
  },
  {
    id: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧',
    prompt: 'Plan a family-friendly trip under ₹5000',
    tags: ['family', 'lake', 'nature'],
    styles: ['Family'],
  },
  {
    id: 'food',
    label: 'Food',
    emoji: '🍜',
    prompt: 'Food-focused trip with great local experiences',
    tags: ['food', 'cafe', 'culture', 'metro'],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    prompt: 'Best destinations for sunset today',
    tags: ['sunset', 'views', 'photo', 'beach'],
  },
];

export function getVibeById(id: string): VibeChip | undefined {
  return VIBE_CHIPS.find((v) => v.id === id);
}

/** Kept for any callers that still filter by vibe tags. */
export function getDestinationsForVibe(vibeId: string): Destination[] {
  const vibe = getVibeById(vibeId);
  if (!vibe) return [];

  const tagged = mockDestinations.filter((d) => {
    const byTag = d.categories.some((c) => vibe.tags.includes(c));
    const byStyle =
      vibe.styles?.some((s) => d.styles.some((ds) => ds.toLowerCase() === s.toLowerCase())) ??
      false;
    return byTag || byStyle;
  });

  if (tagged.length === 0) return [];

  const scored = getRecommendations({ phrase: vibe.label });
  const ids = new Set(tagged.map((d) => d.id));
  return scored.filter((d) => ids.has(d.id));
}

export function countVibeMatches(vibeId: string): number {
  return getDestinationsForVibe(vibeId).length;
}
