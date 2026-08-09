import { Image } from 'react-native';

/**
 * Bundled real photos (Wikimedia Commons / Wikipedia sources).
 * No API key required — works offline for matched place types.
 */
const PLACE_ASSETS = {
  park: require('../assets/places/park.jpg'),
  temple: require('../assets/places/temple.jpg'),
  college: require('../assets/places/college.jpg'),
  station: require('../assets/places/station.jpg'),
  mall: require('../assets/places/mall.jpg'),
  beach: require('../assets/places/beach.jpg'),
  mountain: require('../assets/places/mountain.jpg'),
  chennai: require('../assets/places/chennai.jpg'),
  chromepet: require('../assets/places/chromepet.jpg'),
  historical: require('../assets/places/historical.jpg'),
  food: require('../assets/places/food.jpg'),
} as const;

type AssetKey = keyof typeof PLACE_ASSETS;

type MatchRule = {
  asset: AssetKey;
  keywords: string[];
};

/** More specific rules first. */
const RULES: MatchRule[] = [
  { asset: 'chromepet', keywords: ['chromepet', 'chrompet', 'chrome pet'] },
  { asset: 'mountain', keywords: ['ooty', 'udaagamandalam', 'hill', 'mountain', 'nilgiri'] },
  { asset: 'beach', keywords: ['beach', 'marina', 'seashore', 'coast'] },
  { asset: 'temple', keywords: ['temple', 'kovil', 'mandir', 'place_of_worship', 'church', 'mosque'] },
  { asset: 'college', keywords: ['college', 'university', 'institute', 'school', 'mit'] },
  { asset: 'station', keywords: ['station', 'railway', 'metro'] },
  { asset: 'mall', keywords: ['mall', 'shopping', 'market', 'plaza'] },
  { asset: 'park', keywords: ['park', 'garden', 'playground', 'poonga'] },
  { asset: 'food', keywords: ['food', 'restaurant', 'cafe', 'hotel', 'cuisine'] },
  { asset: 'historical', keywords: ['historic', 'fort', 'museum', 'heritage', 'palace'] },
  { asset: 'chennai', keywords: ['chennai', 'madras', 'tambaram', 'pallavaram', 'guindy', 'adyar'] },
];

function resolveAssetUri(key: AssetKey): string | null {
  try {
    const resolved = Image.resolveAssetSource(PLACE_ASSETS[key]);
    return resolved?.uri ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns a bundled photo URI when the place name matches a known type/area.
 */
export function getBundledPlaceImageUri(placeName: string, area?: string): string | null {
  const haystack = `${placeName} ${area ?? ''}`.toLowerCase();
  if (!haystack.trim()) return null;

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      const uri = resolveAssetUri(rule.asset);
      if (uri) return uri;
    }
  }

  return null;
}

/** Category quick-picks on Home. */
export function getCategoryBundledImageUri(categoryKey: string): string | null {
  const map: Record<string, AssetKey> = {
    beach: 'beach',
    mountain: 'mountain',
    food: 'food',
    historical: 'historical',
    nature: 'park',
  };
  const asset = map[categoryKey];
  return asset ? resolveAssetUri(asset) : null;
}
