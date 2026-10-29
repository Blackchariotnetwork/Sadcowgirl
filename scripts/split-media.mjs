'use strict';
// Split public/media across multiple Pages "media shard" projects so we stay
// under the 20k-files-per-deployment limit without paying for R2.
// - Assigns files to shards (cap SHARD_CAP, newest shard keeps headroom for drip)
// - Copies files into Sadcowgirl/media-shardN/ (gitignored)
// - Writes data/media-shards.json (filename -> shard number) used by build-data
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const SHARD_CAP = parseInt(process.env.SHARD_CAP || '18000', 10);
const MANIFEST = path.join(ROOT, 'data', 'media-shards.json');

const files = fs.readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.jpg')).sort();
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};

// Current shard loads
const shardCounts = {};
for (const f of files) {
  const s = manifest[f];
  if (s) shardCounts[s] = (shardCounts[s] || 0) + 1;
}
let maxShard = Math.max(0, ...Object.keys(shardCounts).map(Number), 0);

let assigned = 0, moved = 0;
for (const f of files) {
  if (manifest[f]) continue;
  // Pick shard with most headroom
  let target = 0, best = Infinity;
  for (let s = 1; s <= maxShard; s++) {
    const c = shardCounts[s] || 0;
    if (c < SHARD_CAP && c < best) { best = c; target = s; }
  }
  if (!target) { maxShard += 1; target = maxShard; shardCounts[target] = 0; }
  manifest[f] = target;
  shardCounts[target] = (shardCounts[target] || 0) + 1;
  assigned++;
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest));

// Materialize shard folders
for (let s = 1; s <= maxShard; s++) {
  const dir = path.join(ROOT, `media-shard${s}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'),
    '<!DOCTYPE html><html><body style="background:#080C14;color:#334155;font-family:monospace">sadcowgirl media node</body></html>');
}
for (const f of files) {
  const dir = path.join(ROOT, `media-shard${manifest[f]}`);
  const dest = path.join(dir, f);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(path.join(MEDIA_DIR, f), dest);
    moved++;
  }
}

const summary = Object.entries(shardCounts).map(([s, c]) => `shard${s}=${c}`).join(' ');
console.log(`[split] files=${files.length} newly-assigned=${assigned} copied=${moved} | ${summary}`);