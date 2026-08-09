import fs from 'fs';

const intel = fs.readFileSync('mocks/destinationIntelligence.ts', 'utf8');
const dest = fs.readFileSync('mocks/destinations.ts', 'utf8');
const re = /https:\/\/images\.unsplash\.com\/[^'\s]+/g;
const urls = [...new Set([...(intel + dest).match(re) || []])];

let fail = 0;
for (const u of urls) {
  const r = await fetch(u);
  if (r.status !== 200) {
    console.log(r.status, u);
    fail += 1;
  }
}
console.log('checked', urls.length, 'failed', fail);
process.exit(fail ? 1 : 0);
