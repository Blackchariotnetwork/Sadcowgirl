'use strict';
// Download the dump's CDN thumbs (poster + gallery photos) for every selected
// video. Image CDN has no anti-bot wall; simple parallel curl downloads.
// Writes data/media.json: { id: { thumb, photos[] } } with local /media paths.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const THUMBS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'dumpthumbs.json'), 'utf8'));
const SEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'selection.json'), 'utf8'));
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const OUT = path.join(ROOT, 'data', 'media.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const CURLBIN = process.platform === 'win32' ? 'curl.exe' : 'curl';
const CONCURRENCY = parseInt(process.env.CONC || '6', 10);
const MAX_PHOTOS = parseInt(process.env.MAXPHOTOS || '6', 10);

fs.mkdirSync(MEDIA_DIR, { recursive: true });

let coolUntil = 0; // global 429 backoff timestamp (ms)
function curlToFile(url, file) {
  const args = ['-s', '--max-time', '30', '-A', UA, '-H', 'Referer: https://www.pornhub.com/', '-w', '%{http_code}', '-o', file, url];
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 35000 }, async (err, stdout) => {
      const status = parseInt(String(stdout).trim(), 10) || 0;
      if (status === 429) {
        // CDN throttle: everyone cools down together
        coolUntil = Math.max(coolUntil, Date.now() + 90000);
        console.log(`[media] 429 -> cooling down 90s`);
      }
      resolve(status);
    });
  });
}
async function waitCooldown() {
  const wait = coolUntil - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

// Build the download plan: poster + up to MAX_PHOTOS gallery shots.
const jobs = [];
const media = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const v of SEL.videos) {
  const t = THUMBS[v.id];
  if (!t) continue;
  if (media[v.id]?.thumb) continue; // already done
  const list = [t.thumb, ...t.photos].filter(Boolean);
  const uniq = [...new Set(list)].slice(0, MAX_PHOTOS);
  jobs.push({ id: v.id, urls: uniq });
}

let done = 0, ok = 0, fail = 0;
const t0 = Date.now();
const queue = [...jobs];

const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const job = queue.shift();
    if (!job) break;
    const local = [];
    let first = true;
    await waitCooldown();
    for (const url of job.urls) {
      const name = first ? `${job.id}.jpg` : `${job.id}_${local.length + 2}.jpg`;
      first = false;
      const file = path.join(MEDIA_DIR, name);
      if (fs.existsSync(file) && fs.statSync(file).size > 3000) {
        local.push(`/media/${name}`);
        continue;
      }
      let st = await curlToFile(url, file);
      if (st !== 200) { await waitCooldown(); await new Promise((r) => setTimeout(r, 1200)); st = await curlToFile(url, file); }
      if (st === 200 && fs.existsSync(file) && fs.statSync(file).size > 3000) {
        local.push(`/media/${name}`);
      } else {
        try { fs.unlinkSync(file); } catch {}
      }
    }
    if (local.length) {
      media[job.id] = { thumb: local[0], photos: local };
      ok++;
    } else {
      fail++;
    }
    done++;
    if (done % 100 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(media));
      console.log(`[media] ${done}/${jobs.length} ok=${ok} fail=${fail} files=${fs.readdirSync(MEDIA_DIR).length} ${Math.round((Date.now() - t0) / 1000)}s`);
    }
  }
});
await Promise.all(workers);
fs.writeFileSync(OUT, JSON.stringify(media));
console.log(`[media] DONE ${done} ok=${ok} fail=${fail} in ${Math.round((Date.now() - t0) / 1000)}s`);