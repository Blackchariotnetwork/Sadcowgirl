'use strict';
// Import beeg videos for a tag into sadcowgirl's static pipeline.
// Usage: node scripts/import-beeg.mjs [tag] [pages]   (tag default "tiktok sluts", page = 48)
// Downloads thumbs to public/media, updates data/media.json, merges data/beeg.json.
// Playback runs through the sadcowgirl-beeg-proxy worker (player: 'hls').
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const STORE = 'https://store.externulls.com';
const THUMBS = 'https://thumbs.externulls.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const TAG = process.argv[2] || 'tiktok sluts';
const PAGES = Math.max(1, parseInt(process.argv[3] || '20', 10) || 20);
const PER_PAGE = 48;
const MAX_PHOTOS = parseInt(process.env.MAXPHOTOS || '6', 10);
const CURLBIN = process.platform === 'win32' ? 'curl.exe' : 'curl';
const MEDIA_DIR = path.join(ROOT, 'public', 'media');

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';
const unescape = (s) => String(s || '')
  .replace(/&rsquo;|&lsquo;|&#8217;/g, "'").replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/g, '"')
  .replace(/&excl;/g, '!').replace(/&comma;/g, ',').replace(/&period;/g, '.')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Fetch listing pages
const units = [];
for (let p = 0; p < PAGES; p++) {
  const offset = p * PER_PAGE;
  let data;
  try {
    data = await fetchJson(`${STORE}/tag/videos/index?limit=${PER_PAGE}&offset=${offset}&tag=${encodeURIComponent(TAG)}`);
  } catch (e) {
    console.error(`[beeg-import] page ${p} failed: ${e.message}`);
    break;
  }
  if (!Array.isArray(data) || data.length === 0) break;
  units.push(...data);
  if (p % 5 === 0) console.log(`[beeg-import] page ${p}: total ${units.length}`);
  await sleep(300);
}
const videos = units.filter((u) => u.file && u.file.id && u.file.data?.[0]?.cd_value && (u.file.fl_duration || 0) >= 60);
console.log(`[beeg-import] ${units.length} units, ${videos.length} usable videos`);

// 2. Build items + thumb jobs
const MEDIA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'media.json'), 'utf8'));
const items = [];
const jobs = [];
for (const u of videos) {
  const fileId = String(u.file.id);
  const id = `beeg-${fileId}`;
  if (MEDIA[id]?.thumb) continue; // already imported
  const title = unescape(u.file.data[0].cd_value).trim();
  const facts = Array.isArray(u.fc_facts) ? u.fc_facts : [];
  const views = facts.reduce((a, f) => a + (f.fc_st_views || 0), 0);
  const offsets = [...new Set(facts.reduce((a, f) => a.concat(f.fc_thumbs || []), []))].filter((x) => typeof x === 'number').slice(0, MAX_PHOTOS);
  const tags = [], models = [];
  for (const t of u.tags || []) {
    if (!t?.tg_name) continue;
    (t.is_person ? models : tags).push(t.tg_name.trim());
  }
  const localPhotos = offsets.map((o) => `/media/beeg-${fileId}-${o}.webp`);
  for (const o of offsets) jobs.push({ url: `${THUMBS}/videos/${fileId}/${o}.webp?size=640x360`, name: `beeg-${fileId}-${o}.webp` });
  items.push({
    id,
    slug: slugify(title),
    title,
    embed: '',
    player: 'hls',
    duration: u.file.fl_duration || 0,
    views,
    likes: facts.reduce((a, f) => a + (f.reactions_count || 0), 0),
    upload: facts[0]?.fc_created ? String(facts[0].fc_created).slice(0, 10) : '',
    categories: tags.length ? [tags[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())] : ['Amateur'],
    tags: tags.slice(0, 10),
    models: models.slice(0, 3),
    _photos: localPhotos,
  });
}
console.log(`[beeg-import] new items: ${items.length}, thumb files to fetch: ${jobs.length}`);

// 3. Download thumbs (beeg thumb CDN works without referer)
let coolUntil = 0;
function curlToFile(url, file) {
  const args = ['-s', '--max-time', '30', '-A', UA, '-w', '%{http_code}', '-o', file, url];
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 35000 }, (err, stdout) => {
      const st = parseInt(String(stdout).trim(), 10) || 0;
      if (st === 429) { coolUntil = Math.max(coolUntil, Date.now() + 60000); }
      resolve(st);
    });
  });
}
const waitCooldown = async () => {
  const w = coolUntil - Date.now();
  if (w > 0) await new Promise((r) => setTimeout(r, w));
};
const queue = [...jobs];
let done = 0, okCount = 0;
const CONC = parseInt(process.env.CONC || '8', 10);
await Promise.all(Array.from({ length: CONC }, async () => {
  while (queue.length) {
    const j = queue.shift();
    if (!j) break;
    const file = path.join(MEDIA_DIR, j.name);
    if (fs.existsSync(file) && fs.statSync(file).size > 500) { done++; continue; }
    await waitCooldown();
    let st = await curlToFile(j.url, file);
    if (st !== 200) { await waitCooldown(); await sleep(800); st = await curlToFile(j.url, file); }
    if (st === 200 && fs.existsSync(file) && fs.statSync(file).size > 500) okCount++;
    else { try { fs.unlinkSync(file); } catch {} }
    done++;
    if (done % 500 === 0) console.log(`[beeg-import] thumbs ${done}/${jobs.length} ok=${okCount}`);
  }
}));
console.log(`[beeg-import] thumbs cached ${okCount}/${jobs.length}`);

// 4. Update media.json for successfully cached videos
let withPhotos = 0;
for (const it of items) {
  const photos = it._photos.filter((p) => {
    const f = path.join(MEDIA_DIR, p.replace('/media/', ''));
    return fs.existsSync(f) && fs.statSync(f).size > 500;
  });
  if (photos.length) {
    MEDIA[it.id] = { thumb: photos[0], photos };
    withPhotos++;
  }
}
fs.writeFileSync(path.join(ROOT, 'data', 'media.json'), JSON.stringify(MEDIA));
console.log(`[beeg-import] videos with thumbs: ${withPhotos}/${items.length}`);

// 5. Merge into data/beeg.json
const OUT = path.join(ROOT, 'data', 'beeg.json');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const keep = prev.filter((p) => MEDIA[p.id]?.thumb);
const seen = new Set(keep.map((p) => p.id));
const fresh = items.filter((it) => { const has = MEDIA[it.id]?.thumb; if (!has || seen.has(it.id)) return false; seen.add(it.id); it.photos = undefined; delete it._photos; return true; });
fs.writeFileSync(OUT, JSON.stringify([...fresh, ...keep], null, 1));
console.log(`[beeg-import] beeg.json now ${fresh.length + keep.length} videos (added ${fresh.length})`);