export interface IntentCategory {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  keywords: string[];
}

export const INTENT_CATEGORIES: IntentCategory[] = [
  {
    id: 'nature',
    label: '🌿 Nature Escape',
    subtitle: 'Fresh air • Lakes • Forests',
    icon: 'leaf',
    keywords: ['nature', 'escape', 'peaceful', 'quiet', 'green', 'forest', 'jungle', 'wildlife', 'outdoors']
  },
  {
    id: 'drives',
    label: '🚗 Scenic Drive',
    subtitle: 'Mountain roads • Coastal routes',
    icon: 'car',
    keywords: ['drive', 'road', 'trip', 'scenic', 'highway', 'bike', 'ride', 'roadtrip']
  },
  {
    id: 'photography',
    label: '📸 Photography Tour',
    subtitle: 'Sunrise • Architecture • Landscapes',
    icon: 'camera',
    keywords: ['photography', 'photo', 'picturesque', 'scenic', 'viewpoint', 'instagram']
  },
  {
    id: 'family',
    label: '👨‍👩‍👧 Family Day Out',
    subtitle: 'Parks • Museums • Attractions',
    icon: 'people',
    keywords: ['family', 'kids', 'children', 'safe', 'friendly', 'group', 'relaxing']
  },
  {
    id: 'food',
    label: '🍜 Food Trail',
    subtitle: 'Local cuisine • Cafés • Street food',
    icon: 'restaurant',
    keywords: ['food', 'cuisine', 'eat', 'restaurant', 'cafe', 'trail', 'tasty', 'culinary', 'local']
  },
  {
    id: 'heritage',
    label: '🏛 Heritage Explorer',
    subtitle: 'Historic sites • Culture • Monuments',
    icon: 'business',
    keywords: ['heritage', 'history', 'culture', 'temple', 'monument', 'ruins', 'fort', 'palace', 'ancient']
  },
  {
    id: 'adventure',
    label: '🏕 Adventure',
    subtitle: 'Trekking • Camping • Outdoor activities',
    icon: 'bicycle',
    keywords: ['adventure', 'trek', 'hike', 'camp', 'rafting', 'thrill', 'sports', 'active']
  },
  {
    id: 'hidden',
    label: '💎 Hidden Gems',
    subtitle: 'Less crowded • Unique places',
    icon: 'diamond',
    keywords: ['hidden', 'gem', 'secret', 'unexplored', 'offbeat', 'less', 'crowded', 'unknown']
  },
  {
    id: 'sunrise',
    label: '🌅 Sunrise Journey',
    subtitle: 'Early morning • Viewpoints',
    icon: 'sunny',
    keywords: ['sunrise', 'morning', 'early', 'dawn']
  },
  {
    id: 'sunset',
    label: '🌇 Sunset Route',
    subtitle: 'Evening • Golden hour',
    icon: 'moon',
    keywords: ['sunset', 'evening', 'dusk', 'golden', 'hour']
  },
  {
    id: 'shopping',
    label: '🛍 Shopping Trail',
    subtitle: 'Local markets • Boutiques',
    icon: 'cart',
    keywords: ['shopping', 'market', 'buy', 'clothes', 'boutique', 'mall']
  },
  {
    id: 'culture',
    label: '🎭 Cultural Experience',
    subtitle: 'Arts • Festivals • Traditions',
    icon: 'color-palette',
    keywords: ['culture', 'art', 'tradition', 'festival', 'local']
  },
  {
    id: 'coastal',
    label: '🌊 Coastal Escape',
    subtitle: 'Beaches • Sea breeze',
    icon: 'water',
    keywords: ['coast', 'beach', 'sea', 'ocean', 'sand', 'water']
  },
  {
    id: 'forest',
    label: '🌲 Forest Retreat',
    subtitle: 'Deep woods • Cabins',
    icon: 'leaf',
    keywords: ['forest', 'woods', 'trees', 'cabin', 'retreat']
  },
  {
    id: 'cafe',
    label: '☕ Café Discovery',
    subtitle: 'Coffee • Aesthetics • Bakeries',
    icon: 'cafe',
    keywords: ['cafe', 'coffee', 'bakery', 'tea', 'aesthetic']
  },
  {
    id: 'outdoor',
    label: '🚲 Outdoor Activities',
    subtitle: 'Cycling • Parks • Picnics',
    icon: 'walk',
    keywords: ['outdoor', 'cycle', 'park', 'picnic', 'walk']
  }
];

export function getMatchingIntents(query: string): IntentCategory[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  // Basic heuristic: check if any keyword matches the query
  return INTENT_CATEGORIES.filter(cat => 
    cat.keywords.some(kw => lowerQuery.includes(kw) || kw.includes(lowerQuery)) ||
    cat.label.toLowerCase().includes(lowerQuery)
  );
}
