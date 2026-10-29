'use strict';
// Scan the Pornhub webmasters dump CSV and select the top-viewed videos
// per category for the sadcowgirl static dataset.
// Usage: node scripts/scan-csv.mjs [perCat] [maxCats]
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const CSV = 'C:/Users/email/.lmstudio/apps/bionic/projects/856087b0-f1a8-44e9-aeb8-55116a6d23de/workspace/tube-cms/data/pornhub.com-db.csv';
const PER_CAT = parseInt(process.argv[2] || '60', 10);
const MAX_CATS = parseInt(process.argv[3] || '28', 10);
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'data', 'selection.json');

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';

// Min-heap-ish: keep sorted array per category capped at PER_CAT by views.
const pools = new Map(); // category -> { list: [], min: 0 }
const catTotals = new Map(); // category -> { count, views }
let scanned = 0, rows = 0, t0 = Date.now();

function consider(cat, views, item) {
  let b = pools.get(cat);
  if (!b) { b = { list: [], min: 0 }; pools.set(cat, b); }
  if (b.list.length >= PER_CAT && views <= b.min) return;
  b.list.push({ views, item });
  b.list.sort((a, c) => c.views - a.views);
  if (b.list.length > PER_CAT) { b.list.length = PER_CAT; b.min = b.list[b.list.length - 1].views; }
}

const rl = readline.createInterface({ input: fs.createReadStream(CSV, { encoding: 'utf8' }), crlfDelay: Infinity });

for await (let line of rl) {
  if (!line || line.length < 40) continue;
  rows++;
  // Rows reliably start with "<iframe"; handle glued lines by splitting.
  const frags = line.startsWith('<iframe') ? [line] : null;
  const parts = frags ? frags : line.split('<iframe').filter(Boolean).map((s) => '<iframe' + s);
  for (const part of parts) {
    const f = part.split('|');
    if (f.length < 11) continue;
    const em = /src=["']https?:\/\/(?:www\.)?pornhub\.com\/embed\/([a-z0-9]+)/i.exec(f[0]);
    const title = f[3];
    if (!em || !title) continue;
    const views = parseInt(f[8], 10) || 0;
    const duration = parseInt(f[7], 10) || 0;
    if (duration < 60) continue; // skip trailers/slideshows
    const cats = f[5] ? f[5].split(';').map((s) => s.trim()).filter(Boolean) : [];
    if (!cats.length) continue;
    scanned++;
    const models = f[6] ? f[6].split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [];
    const tags = f[4] ? f[4].split(';').map((t) => t.trim()).filter(Boolean) : [];
    // primary category = first listed
    const cat = cats[0];
    const tot = catTotals.get(cat) || { count: 0, views: 0 };
    tot.count++; tot.views += views; catTotals.set(cat, tot);
    // upload date from CDN path /videos/yyyymm/dd/<id>/
    const dm = /\/videos\/(\d{6})\/(\d{2})\//.exec(f[1] || '') || /\/videos\/(\d{6})\/(\d{2})\//.exec(f[11] || '');
    const upload = dm ? `${dm[1].slice(0, 4)}-${dm[1].slice(4, 6)}-${dm[2]}` : '';
    consider(cat, views, {
      id: em[1],
      slug: slugify(title),
      title: title.trim(),
      embed: `https://www.pornhub.com/embed/${em[1]}`,
      duration,
      views,
      likes: parseInt(f[9], 10) || 0,
      upload,
      categories: cats.slice(0, 4),
      tags: tags.slice(0, 10),
      models: models.slice(0, 3),
    });
  }
  if (rows % 200000 === 0) {
    const secs = Math.round((Date.now() - t0) / 1000);
    console.error(`[scan] rows=${rows} parsed=${scanned} cats=${pools.size} ${secs}s`);
  }
}

// Rank categories by total views, keep top MAX_CATS with a real pool.
const ranked = [...catTotals.entries()]
  .filter(([, v]) => v.count >= 200)
  .sort((a, b) => b[1].views - a[1].views)
  .slice(0, MAX_CATS);

const categories = ranked.map(([name, v]) => ({ name, slug: slugify(name), videoCount: v.count, totalViews: v.views }));
const seen = new Set();
const videos = [];
for (const [name] of ranked) {
  for (const { item } of (pools.get(name)?.list ?? [])) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    videos.push(item);
  }
}
videos.sort((a, c) => c.views - a.views);

// Models aggregation from the selected set.
const models = new Map();
for (const v of videos) {
  for (const m of v.models) {
    const key = m.toLowerCase();
    let mo = models.get(key);
    if (!mo) { mo = { name: m, slug: slugify(m), videoIds: [], totalViews: 0 }; models.set(key, mo); }
    mo.videoIds.push(v.id);
    mo.totalViews += v.views;
  }
}
const modelList = [...models.values()].filter((m) => m.videoIds.length >= 2)
  .sort((a, b) => b.totalViews - a.totalViews).slice(0, 120);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  perCat: PER_CAT,
  categories,
  models: modelList,
  videos,
}, null, 1));

console.log(`[scan] done in ${Math.round((Date.now() - t0) / 1000)}s: rows=${rows} parsed=${scanned} videos=${videos.length} categories=${categories.length} models=${modelList.length}`);
console.log(`[scan] wrote ${OUT}`);
