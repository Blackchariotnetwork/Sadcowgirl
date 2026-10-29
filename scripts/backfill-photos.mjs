'use strict';
// Backfill photo galleries: for every video with fewer than TARGET photos,
// download the next candidates from the dump's CDN photo list.
// Local files follow the {id}.jpg, {id}_2.._N.jpg naming from fetch-media.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const THUMBS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'dumpthumbs.json'), 'utf8'));
const MEDIA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'media.json'), 'utf8'));
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const CURLBIN = process.platform === 'win32' ? 'curl.exe' : 'curl';
const CONCURRENCY = parseInt(process.env.CONC || '5', 10);
const TARGET = parseInt(process.env.TARGET || '8', 10);

let coolUntil = 0;
function curlToFile(url, file) {
  const args = ['-s', '--max-time', '30', '-A', UA, '-H', 'Referer: https://www.pornhub.com/', '-w', '%{http_code}', '-o', file, url];
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 35000 }, (err, stdout) => {
      const status = parseInt(String(stdout).trim(), 10) || 0;
      if (status === 429) {
        coolUntil = Math.max(coolUntil, Date.now() + 90000);
        console.log('[backfill] 429 -> cooling 90s');
      }
      resolve(status);
    });
  });
}
const waitCooldown = async () => {
  const w = coolUntil - Date.now();
  if (w > 0) await new Promise((r) => setTimeout(r, w));
};

// Build jobs
const jobs = [];
for (const [id, m] of Object.entries(MEDIA)) {
  const t = THUMBS[id];
  if (!t) continue;
  if (m.photos.length >= TARGET) continue;
  const have = m.photos.length;
  // photos[i] corresponds to the i-th unique candidate from fetch-media's list
  const all = [...new Set([...t.photos, t.thumb].filter(Boolean))];
  const candidates = all.slice(have).slice(0, TARGET - have);
  if (!candidates.length) continue;
  jobs.push({ id, have, candidates });
}
console.log(`[backfill] ${jobs.length} videos need more photos (target ${TARGET})`);

let done = 0, added = 0, failed = 0;
const t0 = Date.now();
const queue = [...jobs];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const job = queue.shift();
    if (!job) break;
    await waitCooldown();
    let idx = job.have;
    for (const url of job.candidates) {
      const name = idx === 0 ? `${job.id}.jpg` : `${job.id}_${idx + 2}.jpg`;
      const file = path.join(MEDIA_DIR, name);
      idx++;
      if (fs.existsSync(file) && fs.statSync(file).size > 3000) { job.have++; continue; }
      let st = await curlToFile(url, file);
      if (st !== 200) { await waitCooldown(); st = await curlToFile(url, file); }
      if (st === 200 && fs.existsSync(file) && fs.statSync(file).size > 3000) {
        MEDIA[job.id].photos.push(`/media/${name}`);
        added++;
      } else {
        try { fs.unlinkSync(file); } catch {}
        failed++;
      }
    }
    done++;
    if (done % 100 === 0) {
      fs.writeFileSync(path.join(ROOT, 'data', 'media.json'), JSON.stringify(MEDIA));
      console.log(`[backfill] ${done}/${jobs.length} added=${added} failed=${failed} @${Math.round((Date.now() - t0) / 1000)}s`);
    }
  }
});
await Promise.all(workers);
fs.writeFileSync(path.join(ROOT, 'data', 'media.json'), JSON.stringify(MEDIA));
console.log(`[backfill] DONE ${done} videos, added=${added} failed=${failed} in ${Math.round((Date.now() - t0) / 1000)}s`);