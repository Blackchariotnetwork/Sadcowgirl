'use strict';
// Second CSV pass: for the already-selected videos, collect the dump's CDN
// thumb URLs (large variant + full photo list). The image CDN serves these
// without anti-bot protection, unlike the website.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const CSV = 'C:/Users/email/.lmstudio/apps/bionic/projects/856087b0-f1a8-44e9-aeb8-55116a6d23de/workspace/tube-cms/data/pornhub.com-db.csv';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'selection.json'), 'utf8'));
const OUT = path.join(ROOT, 'data', 'dumpthumbs.json');

const wanted = new Set(SEL.videos.map((v) => v.id));
const found = new Map();
let rows = 0, t0 = Date.now();

const rl = readline.createInterface({ input: fs.createReadStream(CSV, { encoding: 'utf8' }), crlfDelay: Infinity });
for await (let line of rl) {
  if (!line || line.length < 40) continue;
  rows++;
  const parts = line.startsWith('<iframe') ? [line] : line.split('<iframe').filter(Boolean).map((s) => '<iframe' + s);
  for (const part of parts) {
    const f = part.split('|');
    if (f.length < 11) continue;
    const em = /\/embed\/([a-z0-9]+)/i.exec(f[0]);
    if (!em || !wanted.has(em[1])) continue;
    const photos = (f[13] || f[2] || '').split(';').map((s) => s.trim()).filter(Boolean);
    const thumb = (f[12] || f[1] || '').trim();
    if (!thumb && !photos.length) continue;
    found.set(em[1], { thumb, photos });
  }
  if (rows % 500000 === 0) console.error(`[thumbs] rows=${rows} found=${found.size}/${wanted.size} ${Math.round((Date.now() - t0) / 1000)}s`);
}

const obj = Object.fromEntries(found);
fs.writeFileSync(OUT, JSON.stringify(obj));
console.log(`[thumbs] done in ${Math.round((Date.now() - t0) / 1000)}s: ${found.size}/${wanted.size} videos have CDN thumb data`);