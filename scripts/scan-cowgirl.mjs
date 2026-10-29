'use strict';
// Select the top-viewed videos tagged "cowgirl" (tags, categories or title)
// from the dump, excluding anything already in selection.json.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const CSV = 'C:/Users/email/.lmstudio/apps/bionic/projects/856087b0-f1a8-44e9-aeb8-55116a6d23de/workspace/tube-cms/data/pornhub.com-db.csv';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const LIMIT = parseInt(process.argv[2] || '2000', 10);
const OUT = path.join(ROOT, 'data', 'cowgirl.json');

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';
const existing = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'selection.json'), 'utf8')).videos.map((v) => v.id));
const COWGIRL_OUT = path.join(ROOT, 'data', 'cowgirl.json');
const alreadyCowgirl = fs.existsSync(COWGIRL_OUT)
  ? JSON.parse(fs.readFileSync(COWGIRL_OUT, 'utf8'))
  : [];
const keepExisting = alreadyCowgirl.filter((v) => !existing.has(v.id));
for (const v of keepExisting) existing.add(v.id);

// Top-N by views with early reject.
let min = 0;
const list = [];
let rows = 0, matched = 0, t0 = Date.now();

const rl = readline.createInterface({ input: fs.createReadStream(CSV, { encoding: 'utf8' }), crlfDelay: Infinity });
for await (let line of rl) {
  if (!line || line.length < 40) continue;
  rows++;
  const parts = line.startsWith('<iframe') ? [line] : line.split('<iframe').filter(Boolean).map((s) => '<iframe' + s);
  for (const part of parts) {
    const f = part.split('|');
    if (f.length < 11) continue;
    const em = /\/embed\/([a-z0-9]+)/i.exec(f[0]);
    const title = f[3];
    if (!em || !title) continue;
    const id = em[1];
    if (existing.has(id)) continue;
    const tg = (f[4] || '').toLowerCase();
    const ct = (f[5] || '').toLowerCase();
    const tl = title.toLowerCase();
    if (!tg.includes('cowgirl') && !ct.includes('cowgirl') && !tl.includes('cowgirl')) continue;
    const views = parseInt(f[8], 10) || 0;
    const duration = parseInt(f[7], 10) || 0;
    if (duration < 60) continue;
    matched++;
    if (list.length >= LIMIT && views <= min) continue;
    const cats = f[5] ? f[5].split(';').map((s) => s.trim()).filter(Boolean) : [];
    const dm = /\/videos\/(\d{6})\/(\d{2})\//.exec(f[1] || '') || /\/videos\/(\d{6})\/(\d{2})\//.exec(f[11] || '');
    const item = {
      id,
      slug: slugify(title),
      title: title.trim(),
      embed: `https://www.pornhub.com/embed/${id}`,
      duration,
      views,
      likes: parseInt(f[9], 10) || 0,
      upload: dm ? `${dm[1].slice(0, 4)}-${dm[1].slice(4, 6)}-${dm[2]}` : '',
      categories: cats.slice(0, 4),
      tags: (f[4] ? f[4].split(';').map((t) => t.trim()).filter(Boolean) : []).slice(0, 10),
      models: (f[6] ? f[6].split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []).slice(0, 3),
    };
    list.push(item);
    list.sort((a, c) => c.views - a.views);
    if (list.length > LIMIT) { list.length = LIMIT; min = list[list.length - 1].views; }
  }
  if (rows % 1000000 === 0) console.error(`[cowgirl] rows=${rows} matched=${matched} kept=${list.length} ${Math.round((Date.now() - t0) / 1000)}s`);
}

// Merge with previously imported cowgirl batches, newest-batch first.
const merged = [...list, ...keepExisting];
const seen = new Set();
const finalList = merged.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
fs.writeFileSync(OUT, JSON.stringify(finalList, null, 1));
console.log(`[cowgirl] done in ${Math.round((Date.now() - t0) / 1000)}s: matched=${matched} new=${list.length} total=${finalList.length} (limit ${LIMIT})`);
console.log(`[cowgirl] top views: ${list.slice(0, 3).map((v) => v.views.toLocaleString()).join(', ')}`);