import AsyncStorage from '@react-native-async-storage/async-storage';

import { getBundledPlaceImageUri } from '@/constants/placeImageRegistry';

const memoryCache = new Map<string, string | null>();
const DISK_CACHE_KEY = 'urbanlens_place_image_urls_v1';

const WIKI_HEADERS = {
  Accept: 'application/json',
  'Api-User-Agent': 'UrbanLens/1.0 (travel-app; educational-project)',
};

export type PlaceImageLookup = {
  placeName: string;
  latitude?: number;
  longitude?: number;
  area?: string;
  categoryHint?: string;
};

let diskCachePromise: Promise<Record<string, string>> | null = null;

function normalizePlaceQuery(placeName: string) {
  return placeName
    .split(',')[0]
    .trim()
    .replace(/\s+/g, ' ');
}

function cacheKey(lookup: PlaceImageLookup) {
  return normalizePlaceQuery(lookup.placeName).toLowerCase();
}

function buildQueryVariants(placeName: string, area?: string) {
  const base = normalizePlaceQuery(placeName);
  if (!base) return [];
  const areaName = area?.trim();
  return Array.from(
    new Set(
      [
        base,
        areaName ? `${base} ${areaName}` : '',
        areaName ? `${base} ${areaName} India` : '',
        `${base} India`,
        `${base} Chennai`,
        `${base} Tamil Nadu`,
      ].filter(Boolean),
    ),
  );
}

function isLikelyPhotoUrl(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('loremflickr') || lower.includes('placehold')) {
    return false;
  }
  return (
    lower.includes('upload.wikimedia.org') ||
    lower.includes('wikipedia.org') ||
    lower.startsWith('file:') ||
    lower.startsWith('asset:') ||
    /\.(jpe?g|png|webp)(\?|$)/i.test(lower)
  );
}

async function readDiskCache(): Promise<Record<string, string>> {
  if (!diskCachePromise) {
    diskCachePromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(DISK_CACHE_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Record<string, string>;
      } catch {
        return {};
      }
    })();
  }
  return diskCachePromise;
}

async function writeDiskCacheEntry(key: string, url: string) {
  const cache = await readDiskCache();
  if (cache[key] === url) return;
  cache[key] = url;
  diskCachePromise = Promise.resolve(cache);
  await AsyncStorage.setItem(DISK_CACHE_KEY, JSON.stringify(cache));
}

async function fetchCommonsGeoImage(
  latitude: number,
  longitude: number,
  radiusMeters = 1200,
): Promise<string | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query` +
    `&generator=geosearch&ggscoord=${latitude}|${longitude}` +
    `&ggsradius=${radiusMeters}&ggslimit=8&ggsnamespace=6` +
    `&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;

  try {
    const response = await fetch(url, { headers: WIKI_HEADERS });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      query?: {
        pages?: Record<
          string,
          { imageinfo?: Array<{ url?: string; thumburl?: string; mime?: string }> }
        >;
      };
    };
    for (const page of Object.values(data.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info?.mime?.startsWith('image/')) continue;
      const image = info.thumburl || info.url;
      if (image && isLikelyPhotoUrl(image)) return image;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchWikipediaGeoImage(
  latitude: number,
  longitude: number,
  radiusMeters = 5000,
): Promise<string | null> {
  const searchUrl =
    `https://en.wikipedia.org/w/api.php?action=query&list=geosearch` +
    `&gscoord=${latitude}|${longitude}&gsradius=${radiusMeters}&gslimit=6` +
    `&format=json&origin=*`;

  try {
    const searchRes = await fetch(searchUrl, { headers: WIKI_HEADERS });
    if (!searchRes.ok) return null;
    const searchData = (await searchRes.json()) as {
      query?: { geosearch?: Array<{ pageid: number }> };
    };
    const hits = searchData.query?.geosearch ?? [];
    if (!hits.length) return null;

    const ids = hits.map((h) => h.pageid).join('|');
    const imageUrl =
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${ids}` +
      `&prop=pageimages&piprop=thumbnail|original&pithumbsize=800&format=json&origin=*`;
    const imageRes = await fetch(imageUrl, { headers: WIKI_HEADERS });
    if (!imageRes.ok) return null;
    const imageData = (await imageRes.json()) as {
      query?: {
        pages?: Record<
          string,
          { thumbnail?: { source?: string }; original?: { source?: string } }
        >;
      };
    };

    for (const hit of hits) {
      const page = imageData.query?.pages?.[String(hit.pageid)];
      const image = page?.original?.source || page?.thumbnail?.source;
      if (image && isLikelyPhotoUrl(image)) return image;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchWikipediaSummaryImage(
  placeName: string,
  area?: string,
): Promise<string | null> {
  for (const variant of buildQueryVariants(placeName, area).slice(0, 4)) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`;
    try {
      const response = await fetch(url, { headers: WIKI_HEADERS });
      if (!response.ok) continue;
      const data = (await response.json()) as {
        thumbnail?: { source?: string };
        originalimage?: { source?: string };
        type?: string;
      };
      if (data.type === 'disambiguation') continue;
      const image = data.originalimage?.source || data.thumbnail?.source;
      if (image && isLikelyPhotoUrl(image)) return image;
    } catch {
      // continue
    }
  }
  return null;
}

async function fetchWikipediaSearchImage(
  placeName: string,
  area?: string,
): Promise<string | null> {
  for (const variant of buildQueryVariants(placeName, area).slice(0, 3)) {
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(variant)}&gsrlimit=5` +
      `&prop=pageimages&piprop=thumbnail|original&pithumbsize=800` +
      `&format=json&origin=*`;
    try {
      const response = await fetch(searchUrl, { headers: WIKI_HEADERS });
      if (!response.ok) continue;
      const data = (await response.json()) as {
        query?: {
          pages?: Record<
            string,
            {
              title?: string;
              thumbnail?: { source?: string };
              original?: { source?: string };
            }
          >;
        };
      };
      const needle = normalizePlaceQuery(placeName).toLowerCase();
      const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => {
        const aHit = (a.title ?? '').toLowerCase().includes(needle) ? 0 : 1;
        const bHit = (b.title ?? '').toLowerCase().includes(needle) ? 0 : 1;
        return aHit - bHit;
      });
      for (const page of pages) {
        const image = page.original?.source || page.thumbnail?.source;
        if (image && isLikelyPhotoUrl(image)) return image;
      }
    } catch {
      // continue
    }
  }
  return null;
}

async function fetchCommonsSearchImage(
  placeName: string,
  area?: string,
): Promise<string | null> {
  for (const variant of buildQueryVariants(placeName, area).slice(0, 3)) {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
      `&gsrnamespace=6&gsrsearch=${encodeURIComponent(variant)}&gsrlimit=6` +
      `&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;
    try {
      const response = await fetch(url, { headers: WIKI_HEADERS });
      if (!response.ok) continue;
      const data = (await response.json()) as {
        query?: {
          pages?: Record<
            string,
            { imageinfo?: Array<{ url?: string; thumburl?: string; mime?: string }> }
          >;
        };
      };
      for (const page of Object.values(data.query?.pages ?? {})) {
        const info = page.imageinfo?.[0];
        if (!info?.mime?.startsWith('image/')) continue;
        const image = info.thumburl || info.url;
        if (image && isLikelyPhotoUrl(image)) return image;
      }
    } catch {
      // continue
    }
  }
  return null;
}

/**
 * Resolves a place photo with no paid API:
 * 1) Bundled local assets (instant, offline)
 * 2) Saved on-device URL cache
 * 3) Free Wikipedia / Commons live fetch (then saved for next time)
 */
export async function fetchPlaceImage(
  placeNameOrLookup: string | PlaceImageLookup,
  options?: { force?: boolean },
): Promise<string | null> {
  const lookup: PlaceImageLookup =
    typeof placeNameOrLookup === 'string'
      ? { placeName: placeNameOrLookup }
      : placeNameOrLookup;

  const key = cacheKey(lookup);
  if (!key) return null;

  // 1) Bundled assets — immediate, free forever
  const bundled = getBundledPlaceImageUri(lookup.placeName, lookup.area);
  if (bundled) {
    memoryCache.set(key, bundled);
    return bundled;
  }

  if (!options?.force && memoryCache.has(key)) {
    const cached = memoryCache.get(key);
    if (cached) return cached;
  }

  // 2) Disk cache from previous live fetches
  if (!options?.force) {
    const disk = await readDiskCache();
    if (disk[key] && isLikelyPhotoUrl(disk[key])) {
      memoryCache.set(key, disk[key]);
      return disk[key];
    }
  }

  let url: string | null = null;

  // 3) Live free sources (saved for reuse)
  if (lookup.latitude != null && lookup.longitude != null) {
    url =
      (await fetchCommonsGeoImage(lookup.latitude, lookup.longitude, 1200)) ||
      (await fetchWikipediaGeoImage(lookup.latitude, lookup.longitude, 5000));
  }

  if (!url) {
    const resolvers: Array<() => Promise<string | null>> = [
      () => fetchWikipediaSummaryImage(lookup.placeName, lookup.area),
      () => fetchWikipediaSearchImage(lookup.placeName, lookup.area),
      () => fetchCommonsSearchImage(lookup.placeName, lookup.area),
    ];
    for (const resolve of resolvers) {
      try {
        url = await resolve();
        if (url) break;
      } catch {
        // try next
      }
    }
  }

  // 4) Soft category fallback from bundled assets
  if (!url) {
    url =
      getBundledPlaceImageUri(
        `${lookup.placeName} ${lookup.categoryHint ?? ''}`,
        lookup.area,
      ) || getBundledPlaceImageUri(lookup.area || 'chennai');
  }

  if (url) {
    memoryCache.set(key, url);
    // Only persist remote URLs (bundled already local)
    if (url.startsWith('http')) {
      await writeDiskCacheEntry(key, url).catch(() => undefined);
    }
  } else {
    memoryCache.delete(key);
  }

  return url;
}

export async function fetchPlaceImagesLive(
  places: Array<string | PlaceImageLookup>,
  onResult: (placeName: string, imageUrl: string | null) => void,
  options?: { force?: boolean; signal?: { cancelled: boolean } },
): Promise<void> {
  const lookups = places.map((item) =>
    typeof item === 'string' ? { placeName: item } : item,
  );

  await Promise.all(
    lookups.map(async (lookup) => {
      if (options?.signal?.cancelled) return;
      const url = await fetchPlaceImage(lookup, { force: options?.force });
      if (options?.signal?.cancelled) return;
      onResult(lookup.placeName, url);
      const normalized = normalizePlaceQuery(lookup.placeName);
      if (normalized !== lookup.placeName) {
        onResult(normalized, url);
      }
    }),
  );
}

export async function fetchPlaceImages(
  places: Array<string | PlaceImageLookup>,
  options?: { force?: boolean },
): Promise<Record<string, string | null>> {
  const lookups = places.map((item) =>
    typeof item === 'string' ? { placeName: item } : item,
  );
  const result: Record<string, string | null> = {};

  await Promise.all(
    lookups.map(async (lookup) => {
      const url = await fetchPlaceImage(lookup, options);
      const normalized = normalizePlaceQuery(lookup.placeName);
      result[lookup.placeName] = url;
      result[normalized] = url;
    }),
  );

  return result;
}
