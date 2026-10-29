'use strict';
// Drip importer for sadcowgirl.fun — adds the next batch of top-viewed
// cowgirl-tagged videos and ships a fresh deployment.
// Pipeline: scan-cowgirl (new batch) -> scan-thumbs -> fetch-media -> build-data -> deploy.
//
// Gates: media shards must stay under the per-deployment file cap.
// (R2 not needed — media lives in free media-shard Pages projects.)
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

// 1. Headroom check: any shard at the cap means the catalog needs a new shard
// (split-media creates it automatically, so this is informational only).
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'media-shards.json'), 'utf8'));
const shardCounts = {};
for (const s of Object.values(manifest)) shardCounts[s] = (shardCounts[s] || 0) + 1;
const full = Object.entries(shardCounts).filter(([, c]) => c >= MAX_MEDIA_FILES);
if (full.length && Object.keys(shardCounts).length === full.length) {
  LOG('WARN: all media shards at cap — split-media will create a new one this run.');
}

// 3. New batch
run('node', ['scripts/scan-cowgirl.mjs', String(BATCH)]);
// 4. CDN thumb data (full pass)
run('node', ['scripts/scan-thumbs.mjs']);
// 5. Download photos for new ids (resumable)
run('node', ['scripts/fetch-media.mjs'], { env: { ...process.env, MAXPHOTOS: '6', CONC: '5' } });
// 6. Split new files into shards
run('node', ['scripts/split-media.mjs']);
// 7. Build datasets + sitemap
run('node', ['scripts/build-data.mjs']);
// 8. Deploy main app + any shard that changed
run('npx.cmd', ['wrangler', 'pages', 'deploy', 'dist', '--project-name=sadcowgirl', '--branch=main', '--commit-dirty=true']);
const stateFile = path.join(ROOT, 'data', 'shard-state.json');
const deployed = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
const SHARD_BASE = path.resolve(ROOT, '..', '_media-shards');
const shardDirs = fs.existsSync(SHARD_BASE) ? fs.readdirSync(SHARD_BASE).filter((d) => /^media-shard\d+$/.test(d)) : [];
for (const dir of shardDirs) {
  const num = parseInt(dir.replace('media-shard', ''), 10);
  const full = path.join(SHARD_BASE, dir);
  const count = fs.readdirSync(full).length;
  if (deployed[num] === count) continue;
  // cwd = shard dir so wrangler CANNOT discover the main project's wrangler.toml
  run('npx.cmd', ['wrangler', 'pages', 'deploy', '.', `--project-name=sadcowgirl-media${num}`, '--branch=main', '--commit-dirty=true'], { cwd: full });
  deployed[num] = count;
}
fs.writeFileSync(stateFile, JSON.stringify(deployed));

LOG(`DONE — batch of up to ${BATCH} imported and deployed.`);