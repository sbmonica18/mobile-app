/**
 * Turn a raw user query into a clean results-header label.
 * Fixes typos lightly and title-cases — never echo the verbatim typed string.
 */
export function cleanPhraseLabel(raw: string | null | undefined, fallback = 'AI picks'): string {
  if (!raw?.trim()) return fallback;
  let q = raw.trim().toLowerCase();

  const typoMap: Array<[RegExp, string]> = [
    [/\bintersting\b/g, 'interesting'],
    [/\breccomendations?\b/g, 'recommendations'],
    [/\bbeutiful\b/g, 'beautiful'],
    [/\bweeknd\b/g, 'weekend'],
    [/\bnear by\b/g, 'nearby'],
    [/\bplacess\b/g, 'places'],
  ];
  for (const [re, fix] of typoMap) q = q.replace(re, fix);

  // Drop filler openers
  q = q
    .replace(/^(show|find|get|give|suggest|plan|looking for|search for)\s+(me\s+)?(any\s+|some\s+)?/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!q) return fallback;

  // Intent → short title
  if (/interesting|cool|nice|good/.test(q) && /place|spot|destination/.test(q)) {
    return 'Interesting Places Nearby';
  }
  if (/weekend/.test(q)) return 'Weekend Escapes';
  if (/quiet|peaceful|calm|hidden/.test(q)) return 'Quiet Escapes';
  if (/family/.test(q)) return 'Family-Friendly Trips';
  if (/adventure|trek|hike/.test(q)) return 'Adventure Picks';
  if (/beach|coast/.test(q)) return 'Beach Getaways';
  if (/nature|mountain|hill|forest/.test(q)) return 'Nature Escapes';
  if (/photo|sunset|scenic/.test(q)) return 'Scenic & Photo Spots';
  if (/budget|cheap|under\s*₹|under\s*rs/.test(q)) return 'Budget-Friendly Trips';
  if (/nearby|near me|close/.test(q)) return 'Nearby Recommendations';

  // Title-case remaining cleaned phrase (cap length)
  const titled = q
    .split(' ')
    .slice(0, 6)
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
  return titled || fallback;
}

export function matchCountLabel(count: number): string {
  return count === 1 ? '1 match' : `${count} matches`;
}
