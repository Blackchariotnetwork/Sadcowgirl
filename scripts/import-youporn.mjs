'use strict';
// YouPorn importer for sadcowgirl — pulls search listings (SSR), fetches each
// watch page for the official embed URL + duration/views/date, caches the
// og:image poster to public/media (their CDN URLs are signed/expiring).
// Playback: official https://www.youporn.com/embed/{id}/ iframe — same
// mechanism as the PH embeds, and youporn/ypncdn domains are NOT blocked
// by Tigo Colombia (verified on-network).
// Usage: node scripts/import-youporn.mjs [pages] [query1,query2,...]
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const PAGES = Math.max(1, parseInt(process.argv[2] || '10', 10) || 10);
const QUERIES = (process.argv[3] || 'cowgirl,creampie,tiktok').split(',').map((q) => q.trim()).filter(Boolean);
const CURLBIN = process.platform === 'win32' ? 'curl.exe' : 'curl';
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseListing(html) {
  const items = [];
  const blocks = html.split('data-testid="plw_video_thumbnail_link"').slice(1);
  for (const b of blocks) {
    const id = /href="\/watch\/(\d+)\/"/.exec(b);
    if (!id) continue;
    const title = /alt="([^"]{10,300})"/.exec(b);
    items.push({ id: id[1], title: title ? title[1].replace(/&amp;/g, '&').trim() : '' });
  }
  return items;
}

function parseWatch(html, id) {
  const out = { embed: `https://www.youporn.com/embed/${id}/` };
  const dur = /"duration":"PT(\d+)S"/.exec(html) || /"duration":"(\d+)"/.exec(html);
  if (dur) out.duration = parseInt(dur[1], 10);
  const views = /"interactionCount":(\d+)/.exec(html);
  if (views) out.views = parseInt(views[1], 10);
  const up = /"uploadDate":"(\d{4}-\d{2}-\d{2})/.exec(html);
  if (up) out.upload = up[1];
  const og = /property="og:image" content="([^"]+)"/.exec(html);
  if (og) out.thumb = og[1].replace(/&amp;/g, '&');
  // de-escape
  for (const k of ['title', 'thumb']) if (out[k]) out[k] = out[k].replace(/\\\//g, '/');
  return out;
}

function curlToFile(url, file, referer) {
  const args = ['-s', '--max-time', '30', '-A', UA, '-e', referer || 'https://www.youporn.com/', '-w', '%{http_code}', '-o', file, url];
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 35000 }, (err, stdout) => resolve(parseInt(String(stdout).trim(), 10) || 0));
  });
}

const MEDIA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'media.json'), 'utf8'));
const OUT = path.join(ROOT, 'data', 'youporn.json');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const seen = new Set(prev.map((p) => p.id));

const fresh = [];
for (const q of QUERIES) {
  const catName = q.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  for (let p = 1; p <= PAGES; p++) {
    let html;
    try {
      html = await fetchText(`https://www.youporn.com/search/?query=${encodeURIComponent(q)}&page=${p}`);
    } catch (e) { console.error(`[yp] ${q} page ${p}: ${e.message}`); break; }
    const cards = parseListing(html);
    if (!cards.length) break;
    let added = 0;
    for (const c of cards) {
      const id = `yp-${c.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      if (MEDIA[id]?.thumb) continue;
      let w;
      try { w = parseWatch(await fetchText(`https://www.youporn.com/watch/${c.id}/`), c.id); }
      catch (e) { continue; }
      if (!w.thumb) continue;
      const local = `/media/yp-${c.id}-0.jpg`;
      const file = path.join(MEDIA_DIR, `yp-${c.id}-0.jpg`);
      const st = await curlToFile(w.thumb, file);
      if (!(st === 200 && fs.existsSync(file) && fs.statSync(file).size > 1000)) { try { fs.unlinkSync(file); } catch {} continue; }
      MEDIA[id] = { thumb: local, photos: [local] };
      fresh.push({
        id,
        slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video',
        title: c.title || (w.title || '').trim(),
        embed: w.embed,
        source: 'youporn',
        duration: w.duration || 0,
        views: w.views || 0,
        likes: 0,
        upload: w.upload || '',
        categories: [catName],
        tags: [q],
        models: [],
      });
      added++;
      await sleep(400);
    }
    console.log(`[yp] ${q} page ${p}: +${added} (total fresh ${fresh.length})`);
    await sleep(600);
  }
}

// Write media.json + youporn.json
fs.writeFileSync(path.join(ROOT, 'data', 'media.json'), JSON.stringify(MEDIA));
const keep = prev.filter((p) => MEDIA[p.id]?.thumb);
const all = [...fresh, ...keep];
fs.writeFileSync(OUT, JSON.stringify(all, null, 1));
console.log(`[yp] DONE: youporn.json ${all.length} videos (added ${fresh.length})`);