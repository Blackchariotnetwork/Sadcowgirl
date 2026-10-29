'use strict';
// Drip importer for sadcowgirl.fun — adds the next batch of top-viewed
// cowgirl-tagged videos and ships a fresh deployment.
// Pipeline: scan-cowgirl (new batch) -> scan-thumbs -> fetch-media -> build-data -> deploy.
//
// Gates: skips unless R2 is active (post-migration) so we never breach the
// 20k static-file ceiling on Pages.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const LOG = (m) => console.log(`[drip ${new Date().toISOString()}] ${m}`);

const BATCH = parseInt(process.env.DRIP_BATCH || '100', 10);
const MAX_MEDIA_FILES = parseInt(process.env.MAX_MEDIA_FILES || '19500', 10);

function run(cmd, args, opts = {}) {
  LOG(`$ ${cmd} ${args.join(' ')}`);
  return execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
}

// 1. Gate: R2 active?
let r2Ok = false;
try {
  run('npx.cmd', ['wrangler', 'r2', 'bucket', 'list']);
  r2Ok = true;
} catch {
  const out = (() => { try { return run('npx.cmd', ['wrangler', 'r2', 'bucket', 'list']); } catch (e) { return String(e.stdout || e); } })();
  if (!/not enabled|ERROR/i.test(String(out))) r2Ok = true;
}
if (!r2Ok) {
  LOG('SKIP: R2 not enabled yet — media must live in R2 before drip can grow the catalog.');
  process.exit(0);
}

// 2. Headroom check
const mediaCount = fs.readdirSync(path.join(ROOT, 'public', 'media')).length;
if (mediaCount > MAX_MEDIA_FILES) {
  LOG(`SKIP: ${mediaCount} media files exceeds safe ceiling ${MAX_MEDIA_FILES}.`);
  process.exit(0);
}

// 3. New batch
run('node', ['scripts/scan-cowgirl.mjs', String(BATCH)]);
// 4. CDN thumb data (full pass)
run('node', ['scripts/scan-thumbs.mjs']);
// 5. Download photos for new ids (resumable)
run('node', ['scripts/fetch-media.mjs'], { env: { ...process.env, MAXPHOTOS: '6', CONC: '5' } });
// 6. Build datasets + sitemap
run('node', ['scripts/build-data.mjs']);
// 7. Deploy
run('npx.cmd', ['wrangler', 'pages', 'deploy', 'dist', '--project-name=sadcowgirl', '--branch=main', '--commit-dirty=true']);

LOG(`DONE — batch of up to ${BATCH} imported and deployed.`);