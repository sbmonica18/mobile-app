/**
 * Builds the 50-destination popularity catalogue.
 * Run: node scripts/buildPopularityCatalogue.mjs
 * Then: npm run validate:images
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATALOGUE, ATTRACTIONS, IMAGE_POOL } from './catalogueData.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MOCKS = path.join(ROOT, 'mocks');

const failedUrls = [];
const usedCovers = new Set();

function imgUrl(id, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;
}

async function verifyUrl(url) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    return r.status === 200;
  } catch {
    return false;
  }
}

async function verifyAll(urls) {
  const bad = [];
  for (const u of urls) {
    if (!(await verifyUrl(u))) bad.push(u);
  }
  return bad;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseTravelMin(travel) {
  if (/flight/i.test(travel)) return 480;
  const h = travel.match(/(\d+)\s*h/);
  const m = travel.match(/(\d+)\s*m/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0) || 360;
}

function readinessFromAqi(aqi) {
  if (aqi <= 50) return { score: 88, band: 'Excellent' };
  if (aqi <= 80) return { score: 78, band: 'Good' };
  if (aqi <= 120) return { score: 65, band: 'Moderate' };
  return { score: 52, band: 'Poor' };
}

function budgetNumbers(tier, budgetStr) {
  const base = parseInt(budgetStr.replace(/\D/g, ''), 10) || 3000;
  if (tier === 'Premium') return { fuel: Math.round(base * 0.35), food: Math.round(base * 0.25), entry: Math.round(base * 0.08), parking: 150, accommodation: Math.round(base * 0.55), total: Math.round(base * 1.4) };
  if (tier === 'Budget Friendly') return { fuel: Math.round(base * 0.3), food: Math.round(base * 0.2), entry: Math.round(base * 0.05), parking: 50, accommodation: Math.round(base * 0.4), total: Math.round(base * 1.1) };
  return { fuel: Math.round(base * 0.32), food: Math.round(base * 0.22), entry: Math.round(base * 0.06), parking: 100, accommodation: Math.round(base * 0.48), total: Math.round(base * 1.25) };
}

function assignAttractionImages(destId, coverId, poolIndex) {
  const used = new Set([coverId]);
  const imgs = [];
  let idx = poolIndex;
  for (let i = 0; i < 6; i++) {
    while (idx < IMAGE_POOL.length && used.has(IMAGE_POOL[idx])) idx++;
    const id = IMAGE_POOL[idx % IMAGE_POOL.length];
    if (!used.has(id)) {
      imgs.push(id);
      used.add(id);
    }
    idx++;
  }
  while (imgs.length < 6) {
    const id = IMAGE_POOL[(poolIndex + imgs.length) % IMAGE_POOL.length];
    if (!used.has(id)) { imgs.push(id); used.add(id); }
    else break;
  }
  return imgs;
}

function travelTipsFor(d) {
  const tips = {
    delhi: ['Use metro for Old Delhi; autos overcharge tourists.', 'Monuments closed Mondays — plan Amer/Agra separately.', 'Carry mask — AQI spikes in winter.'],
    agra: ['Book Taj Mahal sunrise slot online in advance.', 'Taj is closed Fridays — never use Taj images for other cities.', 'Wear slip-on shoes; shoe covers required inside.'],
    jaipur: ['Start Amer Fort early; afternoon heat is intense.', 'Hawa Mahal best photographed from street cafés opposite.', 'Bargain politely in Johari and Bapu bazaars.'],
    goa: ['Monsoon brings lush greenery but rough seas.', 'Rent scooters only if confident on narrow coastal roads.', 'North Goa parties; South Goa stays quieter.'],
    mumbai: ['Local trains are fastest but crush-hour packed.', 'Gateway area busy weekends — weekday mornings calmer.', 'Try vada pav and pav bhaji near Chowpatty.'],
    varanasi: ['Book dawn boat ride the night before.', 'Dress modestly for ghats and temples.', 'Evening Ganga aarti — arrive 45 min early for front view.'],
    leh: ['Acclimatise 24–48 hours before high passes.', 'Inner Line Permit needed for Nubra and Pangong.', 'Carry warm layers even in summer.'],
    andaman: ['Book Havelock ferries and dives ahead in peak season.', 'Plastic banned on many beaches — carry reusable bottle.', 'Mobile data patchy outside Port Blair.'],
    'rann-of-kutch': [
      'Best visited Nov–Feb (Rann Utsav / winter white-desert window).',
      'Summer heat makes the salt flats harsh — avoid peak noon.',
      'Full-moon nights sell out months ahead; book tent stays early.',
    ],
    ranthambore: ['Book safari zones 1–5 online 90 days ahead.', 'Morning safaris better for tiger sightings.', 'No plastic inside the reserve.'],
  };
  if (tips[d.id]) return tips[d.id];
  if (d.categories.includes('pilgrimage')) return [`Dress modestly for ${d.name} temple visits.`, 'Peak festival weeks mean long darshan queues.', 'Book accommodation near the main shrine for early access.'];
  if (d.categories.includes('hills')) return ['Carry light jacket — evenings cool quickly.', 'Mountain roads need cautious driving after dark.', 'Book stays before long weekends.'];
  if (d.categories.includes('beach')) return ['Reef-safe sunscreen recommended.', 'Check tide times before cliff walks.', 'Peak season ferry and stay bookings fill fast.'];
  return [`Start sightseeing early to beat crowds in ${d.name}.`, 'Cash handy at smaller vendors; UPI widely accepted in town.', 'Check local holiday closures for monuments.'];
}

function bestTimeFor(d) {
  if (d.id === 'rann-of-kutch') {
    return {
      Morning: { window: '6 AM - 10 AM', reason: 'Cool desert light on the white salt flats' },
      Afternoon: { window: 'Avoid 12–3 PM in peak sun', reason: 'Salt glare and heat — rest or visit Bhuj crafts' },
      Evening: { window: '4 PM - 7 PM', reason: 'Golden-hour Rann sunset (signature experience)' },
      Night: { window: 'Full-moon nights', reason: 'White desert under moonlight — seasonal Nov–Feb highlight' },
    };
  }
  if (d.id === 'varanasi') {
    return {
      Morning: { window: '5 AM - 8 AM', reason: 'Dawn boat ride on the Ganga before heat' },
      Afternoon: { window: '12 PM - 3 PM', reason: 'Temples, lanes, and café breaks off the ghats' },
      Evening: { window: '5:30 PM - 7:30 PM', reason: 'Dashashwamedh Ganga Aarti — arrive early' },
      Night: { window: '8 PM - 10 PM', reason: 'Quiet ghat walks; stay lit main lanes' },
    };
  }
  const n = d.name;
  return {
    Morning: { window: '6 AM - 10 AM', reason: `Cooler air and softer light for ${n} landmarks` },
    Afternoon: { window: '12 PM - 3 PM', reason: 'Good for museums, cafés, and indoor heritage' },
    Evening: { window: '4 PM - 7 PM', reason: 'Golden hour viewpoints and promenade walks' },
    Night: { window: '7 PM - 9 PM', reason: d.categories.includes('metro') ? 'Night markets and lit monuments' : 'Quiet dinner; avoid remote drives after dark' },
  };
}

function buildDestination(d, coverId) {
  return `  {
    id: '${d.id}',
    name: '${esc(d.name)}',
    coverImage: '${imgUrl(coverId)}',
    matchScore: ${d.match},
    weather: '${esc(d.weather)}',
    aqi: ${d.aqi},
    budgetEstimate: '${d.budget}',
    travelTime: '${esc(d.travel)}',
    aiSummary: '${esc(d.summary)}',
    moods: [${d.moods.map((m) => `'${m}'`).join(', ')}],
    budgetTier: [${d.budgetTier.map((b) => `'${b}'`).join(', ')}],
    timeFits: [${d.timeFits.map((t) => `'${t}'`).join(', ')}],
    styles: [${d.styles.map((s) => `'${s}'`).join(', ')}],
    categories: [${d.categories.map((c) => `'${c}'`).join(', ')}],
    popularity: ${d.pop},
    coordinates: { latitude: ${d.lat}, longitude: ${d.lon} },
  }`;
}

function buildIntelligence(d, coverId, attrIds, poolIndex) {
  const mins = parseTravelMin(d.travel);
  const dist = Math.round(mins * 0.7);
  const rd = readinessFromAqi(d.aqi);
  const bn = budgetNumbers(d.tier, d.budget);
  const atts = ATTRACTIONS[d.id] || [];
  const attrLines = atts.map(([name, cat], i) =>
    `      { id: '${i + 1}', name: '${esc(name)}', category: '${cat}', distanceKm: ${(i + 1) * 2.3}, image: '${imgUrl(attrIds[i] || IMAGE_POOL[(poolIndex + i) % IMAGE_POOL.length], 600)}' }`,
  ).join(',\n');

  return `  {
    id: '${d.id}',
    name: '${esc(d.name)}',
    state: '${esc(d.state)}',
    heroImage: '${imgUrl(coverId)}',
    matchScore: ${d.match},
    distanceKm: ${dist},
    travelTimeMin: ${mins},
    aiSummary: '${esc(d.summary)}',
    readinessScore: ${rd.score},
    readinessBand: '${rd.band}',
    travelConditions: { fuelCost: ${bn.fuel}, tollCost: ${Math.round(bn.fuel * 0.15)}, totalCost: ${bn.fuel + Math.round(bn.fuel * 0.15)} },
    environment: {
      weather: '${esc(d.weather)}',
      tempC: ${d.categories.includes('hills') ? 18 : d.categories.includes('beach') ? 30 : 28},
      aqi: ${d.aqi},
      aqiStatus: '${d.aqi <= 50 ? 'Good' : d.aqi <= 100 ? 'Moderate' : 'Poor'}',
      uv: ${d.categories.includes('beach') ? 8 : 5},
      uvStatus: '${d.categories.includes('beach') ? 'Very High' : 'Moderate'}',
      rainProbability: ${d.categories.includes('rainy') ? 60 : 15},
      windSpeed: '${d.categories.includes('coastal') ? '18 km/h' : '10 km/h'}',
    },
    budget: {
      fuel: ${bn.fuel}, food: ${bn.food}, entryFees: ${bn.entry}, parking: ${bn.parking}, accommodation: ${bn.accommodation}, total: ${bn.total}, tier: '${d.tier}',
    },
    crowdSafety: {
      crowdLevel: '${d.categories.includes('metro') ? 'High' : d.categories.includes('pilgrimage') ? 'Very High' : 'Moderate'}',
      safetyRating: '${rd.score >= 80 ? 'Excellent' : 'Good'}',
      parkingAvailability: '${d.categories.includes('metro') ? 'Limited' : 'Moderate'}',
      roadConditions: '${d.categories.includes('mountains') ? 'Mountain passes — drive slow' : 'Good highways; local traffic in town'}',
    },
    attractions: [
${attrLines}
    ],
    services: [
      { id: '1', type: 'Hospital', name: '${esc(d.name)} District Hospital', distanceKm: 1.5 },
      { id: '2', type: 'Petrol Pump', name: 'Indian Oil Petrol Pump', distanceKm: 0.9 },
      { id: '3', type: 'ATM', name: 'SBI ATM', distanceKm: 0.5 },
      { id: '4', type: 'Police Station', name: '${esc(d.name)} Police Station', distanceKm: 1.2 },
      { id: '5', type: 'Pharmacy', name: 'Apollo Pharmacy', distanceKm: 0.6 },
      { id: '6', type: 'EV Charging', name: 'Tata Power EZ Charge', distanceKm: 2.5 },
    ],
    bestTime: {
      Morning: { window: '${bestTimeFor(d).Morning.window}', reason: '${esc(bestTimeFor(d).Morning.reason)}' },
      Afternoon: { window: '${bestTimeFor(d).Afternoon.window}', reason: '${esc(bestTimeFor(d).Afternoon.reason)}' },
      Evening: { window: '${bestTimeFor(d).Evening.window}', reason: '${esc(bestTimeFor(d).Evening.reason)}' },
      Night: { window: '${bestTimeFor(d).Night.window}', reason: '${esc(bestTimeFor(d).Night.reason)}' },
    },
    travelTips: [
      '${esc(travelTipsFor(d)[0])}',
      '${esc(travelTipsFor(d)[1])}',
      '${esc(travelTipsFor(d)[2])}',
    ],
  }`;
}

async function main() {
  console.log('Verifying cover image URLs…');
  const coverAssignments = {};
  for (const d of CATALOGUE) {
    const coverId = d.cover;
    const url = imgUrl(coverId);
    const norm = url.split('?')[0];
    if (usedCovers.has(norm)) {
      console.error(`Duplicate cover for ${d.id}: ${coverId}`);
      process.exit(1);
    }
    if (!(await verifyUrl(url))) {
      failedUrls.push(url);
      console.error(`Cover FAILED ${d.id}: ${url}`);
    } else {
      usedCovers.add(norm);
      coverAssignments[d.id] = coverId;
    }
  }

  if (failedUrls.length) {
    console.error(`\n${failedUrls.length} cover URL(s) failed verification. Aborting.`);
    process.exit(1);
  }

  console.log(`✓ All ${CATALOGUE.length} cover URLs verified`);

  const destBlocks = [];
  const intelBlocks = [];
  let poolIdx = 0;

  for (const d of CATALOGUE) {
    const coverId = coverAssignments[d.id];
    const attrIds = assignAttractionImages(d.id, coverId, poolIdx);
    poolIdx += 7;
    destBlocks.push(buildDestination(d, coverId));
    intelBlocks.push(buildIntelligence(d, coverId, attrIds, poolIdx));
  }

  const catalogueExtra = `/**
 * Curated catalogue — 50 popular Indian destinations.
 * Generated by scripts/buildPopularityCatalogue.mjs — do not edit by hand.
 */
import type { Destination } from './destinations';
import type { DestinationIntelligence } from './destinationIntelligence';

export const extraDestinations: Destination[] = [
${destBlocks.join(',\n')},
];

export const extraIntelligence: DestinationIntelligence[] = [
${intelBlocks.join(',\n')},
];
`;

  const placeImagesLines = CATALOGUE.map((d) => {
    const comment = d.categories.includes('beach') ? ' // coastal' : d.id === 'agra' ? ' // Taj Mahal — Agra only' : d.id === 'amritsar' ? ' // Golden Temple' : '';
    return `  '${d.id}': '${imgUrl(d.cover)}',${comment}`;
  });

  const placeImages = `/**
 * Place-accurate cover/hero images for catalogue destinations.
 * Generated by scripts/buildPopularityCatalogue.mjs — do not edit by hand.
 */
export const PLACE_COVER_IMAGES: Record<string, string> = {
${placeImagesLines.join('\n')}
};

export function placeCover(id: string, fallback?: string): string {
  return PLACE_COVER_IMAGES[id] || fallback || PLACE_COVER_IMAGES.delhi;
}
`;

  fs.writeFileSync(path.join(MOCKS, 'catalogueExtra.ts'), catalogueExtra);
  fs.writeFileSync(path.join(MOCKS, 'placeImages.ts'), placeImages);
  console.log('Wrote catalogueExtra.ts and placeImages.ts');

  // Patch destinations.ts — empty baseDestinations + updated REGION_IDS + hardCategoryFilter
  const destPath = path.join(MOCKS, 'destinations.ts');
  let destSrc = fs.readFileSync(destPath, 'utf8');

  destSrc = destSrc.replace(
    /const baseDestinations: Destination\[\] = \[[\s\S]*?\n\];/,
    'const baseDestinations: Destination[] = [];',
  );

  const newRegionIds = `const REGION_IDS: Record<string, string[]> = {
  delhi: ['delhi', 'agra'],
  uttar: ['agra', 'varanasi', 'delhi'],
  rajasthan: ['jaipur', 'udaipur', 'jaisalmer', 'jodhpur', 'mount-abu', 'pushkar', 'ranthambore'],
  kerala: ['munnar', 'wayanad', 'kovalam', 'alleppey', 'kochi'],
  himachal: ['manali', 'shimla'],
  ladakh: ['leh'],
  goa: ['goa'],
  andaman: ['andaman'],
  uttarakhand: ['mussoorie', 'rishikesh', 'haridwar', 'nainital'],
  karnataka: ['coorg', 'hampi', 'mysore', 'bangalore'],
  maharashtra: ['mumbai', 'mahabaleshwar', 'ajanta-ellora', 'shirdi'],
  tamil: ['ooty', 'kodaikanal', 'chennai', 'madurai', 'rameswaram', 'pondicherry'],
  punjab: ['amritsar'],
  odisha: ['puri'],
  sikkim: ['gangtok'],
  gujarat: ['dwarka', 'rann-of-kutch'],
  bengal: ['kolkata', 'darjeeling'],
  telangana: ['hyderabad'],
  bihar: ['bodh-gaya'],
  andhra: ['tirupati'],
  jammu: ['vaishno-devi'],
  madhya: ['khajuraho'],
};`;

  destSrc = destSrc.replace(/const REGION_IDS: Record<string, string\[\]> = \{[\s\S]*?\};/, newRegionIds);

  const newHardFilter = `function hardCategoryFilter(phraseLower: string): ((d: Destination) => boolean) | null {
  if (/pilgrimage|temple|darshan|shrine/.test(phraseLower)) {
    return (d) => d.categories.some((c) => c === 'pilgrimage');
  }
  if (/spiritual|yoga|ashram/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /pilgrimage|spiritual/.test(c));
  }
  if (/metro|city|urban/.test(phraseLower) && !/metro.?station/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /metro|urban/.test(c));
  }
  if (/beach|coast|sea|ocean|island/.test(phraseLower)) {
    return (d) => d.categories.includes('beach') || d.categories.includes('coastal');
  }
  if (/wildlife|safari|rhino|tiger/.test(phraseLower)) {
    return (d) => d.categories.includes('wildlife');
  }
  if (/desert|dune|rann/.test(phraseLower)) {
    return (d) => d.categories.includes('desert');
  }
  if (/heritage|fort|palace|taj|monument|architecture/.test(phraseLower)) {
    return (d) => d.categories.some((c) => /heritage|architecture|culture/.test(c));
  }
  if (/backwater|houseboat/.test(phraseLower)) {
    return (d) => d.id === 'alleppey' || d.categories.includes('backwaters') || d.categories.includes('lake');
  }
  if (
    /\\b(food|biryani|cuisine)\\b/.test(phraseLower) &&
    !/photo|nature|beach|heritage|wildlife|safari/.test(phraseLower)
  ) {
    return (d) => d.categories.some((c) => /food|cafe|coffee/.test(c));
  }
  return null;
}`;

  destSrc = destSrc.replace(
    /\/\*\* Strong intents must match real category tags[\s\S]*?return null;\n\}/,
    `/** Strong intents must match real category tags — not soft scenic/sunset stand-ins. */\n${newHardFilter}`,
  );

  // Update safari scoring references
  destSrc = destSrc.replace(
    /\['jim-corbett', 'kaziranga', 'thekkady'\]/g,
    "['ranthambore', 'wayanad']",
  );

  // Expand knownIntent regex for pilgrimage
  destSrc = destSrc.replace(
    /wildlife\|under\|₹\|rs\|beach/,
    'wildlife|pilgrimage|spiritual|under|₹|rs|beach',
  );

  fs.writeFileSync(destPath, destSrc);
  console.log('Patched destinations.ts');

  // Patch destinationIntelligence.ts — empty base, only extraIntelligence
  const intelPath = path.join(MOCKS, 'destinationIntelligence.ts');
  let intelSrc = fs.readFileSync(intelPath, 'utf8');
  intelSrc = intelSrc.replace(
    /const baseDestinationIntelligence: DestinationIntelligence\[\] = \[[\s\S]*?\n\];/,
    'const baseDestinationIntelligence: DestinationIntelligence[] = [];',
  );
  if (!intelSrc.includes('export const mockDestinationIntelligence')) {
    intelSrc = intelSrc.replace(
      'const baseDestinationIntelligence: DestinationIntelligence[] = [];',
      `const baseDestinationIntelligence: DestinationIntelligence[] = [];

export const mockDestinationIntelligence: DestinationIntelligence[] = [
  ...baseDestinationIntelligence,
  ...extraIntelligence,
];`,
    );
  }
  intelSrc = intelSrc.replace(
    /const base = dest \? \{ \.\.\.dest \} : \{ \.\.\.mockDestinationIntelligence\[1\], id \};/,
    'const base = dest ? { ...dest } : { ...mockDestinationIntelligence[0], id };',
  );
  fs.writeFileSync(intelPath, intelSrc);
  console.log('Patched destinationIntelligence.ts');

  console.log('\n50 destination ids:', CATALOGUE.map((d) => d.id).join(', '));
  console.log('\nRun: npm run validate:images');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
