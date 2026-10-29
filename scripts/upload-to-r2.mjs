'use strict';
// Upload every file in public/media to the sadcowgirl-media R2 bucket via the
// uploader Worker (the S3 endpoint is not reachable from this network).
// Resumable: checks /check/<key> before uploading. Run again to fill gaps.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const ENDPOINT = 'https://sadcowgirl-media-uploader.blackchariot-net.workers.dev';
const KEY = 'sgm-up-7f4d9c21a8e64b35';
const CONCURRENCY = parseInt(process.env.CONC || '24', 10);

const files = fs.readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.jpg'));
console.log(`[r2] ${files.length} files to consider`);

const state = fs.existsSync(path.join(ROOT, 'data', 'r2-done.json'))
  ? new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'r2-done.json'), 'utf8')))
  : new Set();
let done = 0, skipped = 0, failed = 0;
const t0 = Date.now();

async function exists(key) {
  try {
    const r = await fetch(`${ENDPOINT}/check/${key}`);
    const j = await r.json();
    return !!j.exists;
  } catch { return false; }
}

const queue = files.map((f) => f);
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const name = queue.shift();
    if (!name) break;
    const key = encodeURIComponent(name);
    if (state.has(name) || (await exists(key))) {
      state.add(name); skipped++;
      continue;
    }
    const buf = fs.readFileSync(path.join(MEDIA_DIR, name));
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetch(`${ENDPOINT}/u/${key}`, {
          method: 'PUT',
          headers: { 'X-Admin-Key': KEY, 'content-type': 'image/jpeg' },
          body: buf,
        });
        if (r.ok) { state.add(name); done++; break; }
        if (attempt === 3) failed++;
      } catch (e) {
        if (attempt === 3) failed++;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
    if ((done + skipped) % 500 === 0) {
      fs.writeFileSync(path.join(ROOT, 'data', 'r2-done.json'), JSON.stringify([...state]));
      console.log(`[r2] done=${done} skipped=${skipped} failed=${failed} @${Math.round((Date.now() - t0) / 1000)}s`);
    }
  }
});
await Promise.all(workers);
fs.writeFileSync(path.join(ROOT, 'data', 'r2-done.json'), JSON.stringify([...state]));
console.log(`[r2] DONE uploaded=${done} already-there=${skipped} failed=${failed} in ${Math.round((Date.now() - t0) / 1000)}s`);