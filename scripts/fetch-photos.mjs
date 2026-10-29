'use strict';
// Fetch a permanent poster photo for every selected video by reading the
// PH embed page (cookies from the harvested ph-cookies.json) and downloading
// the image_url asset. Writes data/photos.json mapping id -> /media/<id>.jpg
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'selection.json'), 'utf8'));
const PH_DATA = 'C:/Users/email/.lmstudio/apps/bionic/projects/856087b0-f1a8-44e9-aeb8-55116a6d23de/workspace/tube-cms/data';
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const OUT = path.join(ROOT, 'data', 'photos.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const CURLBIN = process.platform === 'win32' ? 'curl.exe' : 'curl';
const CONCURRENCY = parseInt(process.env.CONC || '3', 10);
const PACING_MS = parseInt(process.env.PACE || '450', 10);

let cookies = '';
let cookieUA = UA;
try {
  const j = JSON.parse(fs.readFileSync(path.join(PH_DATA, 'ph-cookies.json'), 'utf8'));
  cookies = j.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  cookieUA = j.ua || UA;
} catch { /* no cookies; try bare */ }

fs.mkdirSync(MEDIA_DIR, { recursive: true });
const photos = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
let done = 0, ok = 0, fail = 0;
const t0 = Date.now();

let dbgCount = 0, tmpSeq = 0;
function curlBody(url, useCookies) {
  // Write to a temp file (piped stdout hangs curl on this box) and read it back.
  const tmp = path.join(MEDIA_DIR, `_tmp_${process.pid}_${++tmpSeq}.html`);
  const args = ['-s', '-L', '--max-time', '25', '-A', useCookies ? cookieUA : UA];
  if (useCookies && cookies) args.push('-H', `Cookie: ${cookies}`);
  args.push('-H', 'Referer: https://www.pornhub.com/', '-w', '%{http_code}', '-o', tmp, url);
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 32000 }, (err, stdout) => {
      let body = '';
      try { body = fs.readFileSync(tmp, 'utf8'); } catch {}
      try { fs.unlinkSync(tmp); } catch {}
      const status = parseInt(String(stdout).trim(), 10) || 0;
      if (!status && err && dbgCount++ < 5) console.error(`[curl-err] ${url.slice(0, 60)}: ${err.message}`);
      resolve({ status, body });
    });
  });
}

function curlToFile(url, file) {
  const args = ['-s', '--max-time', '35', '-A', cookieUA, '-H', 'Referer: https://www.pornhub.com/', '-w', '%{http_code}', '-o', file, url];
  return new Promise((resolve) => {
    execFile(CURLBIN, args, { timeout: 40000 }, (err, stdout) => resolve(parseInt(String(stdout).trim(), 10) || 0));
  });
}

async function grabPoster(v) {
  const file = path.join(MEDIA_DIR, `${v.id}.jpg`);
  if (fs.existsSync(file) && fs.statSync(file).size > 3000) return true; // already cached
  for (const useCookies of [true, false]) {
    const { status, body } = await curlBody(v.embed, useCookies);
    if (body.includes('leastFactor')) {
      console.log('[challenge] hit anti-bot wall, cooling down 45s');
      await new Promise((r) => setTimeout(r, 45000));
      continue;
    }
    if (status !== 200) continue;
    const html = body.replace(/\\\//g, '/');
    let m = /"image_url":"(https:[^"]+?\.(?:jpg|jpeg|webp)[^"]*?)"/.exec(body) || /"image_url":"(https:[^"]+?)"/.exec(body);
    let url = m ? m[1].replace(/\\\//g, '/') : '';
    if (!url) {
      m = /(https:\/\/pix-[a-z0-9-]+\.phncdn\.com\/[^"'\s]+\.(?:jpg|webp))/.exec(html);
      url = m ? m[1] : '';
    }
    if (!url) continue;
    const st = await curlToFile(url, file);
    if (st === 200 && fs.existsSync(file) && fs.statSync(file).size > 3000) return true;
  }
  return false;
}

const queue = SEL.videos.filter((v) => !photos[v.id]);
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const v = queue.shift();
    if (!v) break;
    let success = await grabPoster(v);
    if (!success) { await new Promise((r) => setTimeout(r, 1500)); success = await grabPoster(v); }
    photos[v.id] = success ? `/media/${v.id}.jpg` : '';
    await new Promise((r) => setTimeout(r, PACING_MS));
    done++; success ? ok++ : fail++;
    if (done % 50 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(photos, null, 0));
      console.log(`[photos] ${done}/${done + queue.length} ok=${ok} fail=${fail} ${Math.round((Date.now() - t0) / 1000)}s`);
    }
  }
});
await Promise.all(workers);
fs.writeFileSync(OUT, JSON.stringify(photos, null, 0));
console.log(`[photos] DONE ${done} ok=${ok} fail=${fail} in ${Math.round((Date.now() - t0) / 1000)}s`);