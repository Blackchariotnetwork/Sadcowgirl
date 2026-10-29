'use strict';
// Merge selection.json + photos.json into the runtime datasets in public/data/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'selection.json'), 'utf8'));
const MEDIA = fs.existsSync(path.join(ROOT, 'data', 'media.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'media.json'), 'utf8'))
  : {};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';

// Only keep videos that actually have photos (no dead-end cards).
const videos = [];
for (const v of SEL.videos) {
  const m = MEDIA[v.id];
  if (!m || !m.thumb) continue;
  videos.push({ ...v, thumbUrl: m.thumb, photos: m.photos });
}

// Categories recomputed over the kept set (primary category only — the
// frontend filters by v.category which is the dump's first listed category).
const catMap = new Map();
for (const v of videos) {
  const c = v.categories[0];
  if (!c) continue;
  const e = catMap.get(c) || { name: c, slug: slugify(c), videoCount: 0, totalViews: 0 };
  e.videoCount++; e.totalViews += v.views;
  catMap.set(c, e);
}
const categories = [...catMap.values()].sort((a, b) => b.totalViews - a.totalViews);
const keepCats = new Set(categories.map((c) => c.name));

// Models recomputed over the kept set.
const modelMap = new Map();
for (const v of videos) {
  for (const m of v.models) {
    const key = m.toLowerCase();
    const e = modelMap.get(key) || { name: m, slug: slugify(m), videoIds: [], totalViews: 0 };
    e.videoIds.push(v.id);
    e.totalViews += v.views;
    modelMap.set(key, e);
  }
}
const models = [...modelMap.values()]
  .filter((m) => m.videoIds.length >= 2)
  .sort((a, b) => b.totalViews - a.totalViews)
  .slice(0, 120);
for (const m of models) {
  const top = videos.filter((v) => m.videoIds.includes(v.id)).sort((a, b) => b.views - a.views)[0];
  m.photo = top ? top.thumbUrl : undefined;
}

const outDir = path.join(ROOT, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'videos.json'), JSON.stringify(videos));
fs.writeFileSync(path.join(outDir, 'categories.json'), JSON.stringify(categories));
fs.writeFileSync(path.join(outDir, 'models.json'), JSON.stringify(models));
console.log(`[build-data] videos=${videos.length} categories=${categories.length} models=${models.length}`);
console.log(`[build-data] category list: ${categories.slice(0, 8).map((c) => c.name).join(', ')}...`);
const sizes = ['videos.json', 'categories.json', 'models.json'].map((f) => `${f}=${(fs.statSync(path.join(outDir, f)).size / 1024).toFixed(0)}KB`);
console.log(`[build-data] sizes: ${sizes.join(' ')}`);