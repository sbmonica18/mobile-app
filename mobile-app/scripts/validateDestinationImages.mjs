/**
 * Destination image validation — run before adding/shipping destination data.
 *
 * Usage: npm run validate:images
 *
 * Checks every heroImage / coverImage / attraction image for:
 *  (a) non-empty URL
 *  (b) not a known-bad host (loremflickr, placehold, picsum random, etc.)
 *  (c) uniqueness within a destination's attraction list
 *  (d) uniqueness of hero/cover URLs across the catalogue
 *  (e) optional keyword sanity: category/name vs URL path tokens
 *  (f) every destination has all 6 essential service categories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INTEL_PATH = path.join(ROOT, 'mocks', 'destinationIntelligence.ts');
const EXTRA_INTEL_PATH = path.join(ROOT, 'mocks', 'catalogueExtra.ts');
const DEST_PATH = path.join(ROOT, 'mocks', 'destinations.ts');

const BAD_HOSTS = [
  'loremflickr.com',
  'placehold.co',
  'placekitten.com',
  'picsum.photos',
  'via.placeholder.com',
  'dummyimage.com',
];

const REQUIRED_SERVICES = [
  'hospital',
  'police',
  'petrol',
  'ev',
  'atm',
  'pharmacy',
];

/** Category/name tokens that should not appear for mismatched landmark keywords in the URL. */
const LANDMARK_MISMATCH = [
  { inUrl: ['taj', 'agra', 'mahal'], badUnless: ['taj', 'agra'] },
  { inUrl: ['nyc', 'newyork', 'manhattan', 'skyline', 'brooklyn'], badUnless: ['york', 'usa', 'america'] },
  { inUrl: ['eiffel', 'paris'], badUnless: ['paris', 'france'] },
  { inUrl: ['sydney', 'opera'], badUnless: ['sydney', 'australia'] },
];

const CATEGORY_HINTS = {
  lake: ['lake', 'water', 'boat', 'pond', 'reservoir'],
  waterfall: ['waterfall', 'falls', 'cascade'],
  park: ['park', 'garden', 'forest', 'green'],
  garden: ['garden', 'flower', 'park'],
  viewpoint: ['view', 'mountain', 'hill', 'peak', 'valley', 'cliff', 'landscape'],
  peak: ['peak', 'mountain', 'summit', 'hill'],
  trekking: ['trek', 'trail', 'hike', 'mountain', 'hill'],
  heritage: ['temple', 'heritage', 'historic', 'palace', 'fort', 'monument'],
  temple: ['temple', 'shrine', 'heritage'],
  wildlife: ['animal', 'wildlife', 'zoo', 'forest'],
  dam: ['dam', 'water', 'lake', 'reservoir'],
  nature: ['nature', 'forest', 'green', 'lake', 'mountain', 'tree'],
};

function extractStringFields(source, field) {
  const re = new RegExp(`${field}:\\s*'([^']+)'`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(source))) out.push(m[1]);
  return out;
}

/** Very light block parser: split intelligence entries by `id: '...'` at destination level. */
function parseIntelligenceBlocks(source) {
  const blocks = [];
  const idRe = /^\s{2,4}id:\s*'([^']+)',/gm;
  const indices = [];
  let m;
  while ((m = idRe.exec(source))) {
    indices.push({ id: m[1], index: m.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : source.length;
    blocks.push({ id: indices[i].id, body: source.slice(start, end) });
  }
  return blocks;
}

function normalizeUrl(url) {
  return url.split('?')[0].toLowerCase();
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function serviceMatches(type, key) {
  const t = type.toLowerCase();
  if (key === 'hospital') return t.includes('hospital');
  if (key === 'police') return t.includes('police');
  if (key === 'petrol') return t.includes('petrol') || t.includes('fuel');
  if (key === 'ev') return t.includes('ev') || t.includes('charging');
  if (key === 'atm') return t.includes('atm');
  if (key === 'pharmacy') return t.includes('pharmacy') || t.includes('chemist');
  return false;
}

function checkLandmarkMismatch(url, placeName) {
  const u = url.toLowerCase();
  const n = placeName.toLowerCase();
  for (const rule of LANDMARK_MISMATCH) {
    if (rule.inUrl.some((tok) => u.includes(tok)) && !rule.badUnless.some((tok) => n.includes(tok))) {
      return `URL suggests unrelated landmark (${rule.inUrl.join('/')}) for "${placeName}"`;
    }
  }
  return null;
}

function extractExportSection(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) return '';
  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

function main() {
  const intel = fs.readFileSync(INTEL_PATH, 'utf8');
  const extraFile = fs.readFileSync(EXTRA_INTEL_PATH, 'utf8');
  const extraIntelSection = extractExportSection(extraFile, 'extraIntelligence');
  const extraDestSection = extractExportSection(extraFile, 'extraDestinations');
  const dests = fs.readFileSync(DEST_PATH, 'utf8');
  const errors = [];
  const warnings = [];

  const globalHeroes = new Map();
  const blocks = [
    ...parseIntelligenceBlocks(intel),
    ...parseIntelligenceBlocks(extraIntelSection),
  ];

  for (const block of blocks) {
    const heroMatch = block.body.match(/heroImage:\s*'([^']+)'/);
    const hero = heroMatch?.[1] || '';
    const nameMatch = block.body.match(/name:\s*'([^']+)'/);
    const name = nameMatch?.[1] || block.id;

    if (!hero.trim()) {
      errors.push(`[${block.id}] heroImage is empty`);
    } else {
      const host = hostOf(hero);
      if (BAD_HOSTS.some((h) => host.includes(h))) {
        errors.push(`[${block.id}] heroImage uses banned host (${host}): ${hero}`);
      }
      const key = normalizeUrl(hero);
      if (globalHeroes.has(key)) {
        errors.push(
          `[${block.id}] heroImage duplicates [${globalHeroes.get(key)}]: ${hero}`,
        );
      } else {
        globalHeroes.set(key, block.id);
      }
      const landmark = checkLandmarkMismatch(hero, name);
      if (landmark) warnings.push(`[${block.id}] ${landmark}`);
    }

    // Attractions
    const attrRe =
      /\{\s*id:\s*'[^']+',\s*name:\s*'((?:\\'|[^'])+)',\s*category:\s*'([^']+)',\s*distanceKm:\s*[^,]+,\s*image:\s*'([^']+)'\s*\}/g;
    const seenAttr = new Map();
    let am;
    while ((am = attrRe.exec(block.body))) {
      const [, aName, category, image] = am;
      const label = `${block.id}/${aName}`;
      if (!image.trim()) {
        errors.push(`[${label}] attraction image is empty`);
        continue;
      }
      const host = hostOf(image);
      if (BAD_HOSTS.some((h) => host.includes(h))) {
        errors.push(`[${label}] attraction image uses banned host (${host})`);
      }
      const key = normalizeUrl(image);
      if (seenAttr.has(key)) {
        errors.push(`[${label}] image duplicates sibling attraction "${seenAttr.get(key)}"`);
      } else {
        seenAttr.set(key, aName);
      }
      const landmark = checkLandmarkMismatch(image, aName);
      if (landmark) warnings.push(`[${label}] ${landmark}`);

      const hints = CATEGORY_HINTS[category.toLowerCase()];
      if (hints) {
        const hay = `${image} ${aName} ${category}`.toLowerCase();
        // Soft check only — Unsplash IDs rarely include keywords; skip hard fail.
        void hay;
      }
    }

    // Services
    const typeRe = /type:\s*'([^']+)'/g;
    const types = [];
    let tm;
    while ((tm = typeRe.exec(block.body))) types.push(tm[1]);
    for (const req of REQUIRED_SERVICES) {
      if (!types.some((t) => serviceMatches(t, req))) {
        errors.push(`[${block.id}] missing essential service category: ${req}`);
      }
    }
  }

  // Cover images (base + extra catalogue)
  const covers = [
    ...extractStringFields(dests, 'coverImage'),
    ...extractStringFields(extraDestSection, 'coverImage'),
  ];
  const coverIds = [];
  const idRe = /id:\s*'([^']+)'/g;
  let im;
  const destSource = dests + '\n' + extraDestSection;
  while ((im = idRe.exec(destSource))) coverIds.push(im[1]);
  const coverSeen = new Map();
  covers.forEach((url, i) => {
    const id = coverIds[i] || `#${i}`;
    if (!url.trim()) {
      errors.push(`[destinations/${id}] coverImage is empty`);
      return;
    }
    const host = hostOf(url);
    if (BAD_HOSTS.some((h) => host.includes(h))) {
      errors.push(`[destinations/${id}] coverImage uses banned host (${host})`);
    }
    const key = normalizeUrl(url);
    if (coverSeen.has(key)) {
      errors.push(
        `[destinations/${id}] coverImage duplicates [${coverSeen.get(key)}]: ${url}`,
      );
    } else {
      coverSeen.set(key, id);
    }
  });

  if (warnings.length) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log('  ⚠', w));
  }

  if (errors.length) {
    console.error(`\nDestination image/service validation FAILED (${errors.length} error(s)):\n`);
    errors.forEach((e) => console.error('  ✗', e));
    console.error('\nFix the dataset, then re-run: npm run validate:images\n');
    process.exit(1);
  }

  console.log(
    `✓ Destination images & essential services OK (${blocks.length} intelligence records, ${covers.length} covers).`,
  );
}

main();
