'use strict';
// Nightly IndexNow ping for sadcowgirl.fun — submits the newest watch pages.
const fs = require('node:fs');
const KEY = '80d02d0e765c4f1cb71cdc879e6c6e71';
const HOST = 'https://sadcowgirl.fun';
(async () => {
  const vids = JSON.parse(fs.readFileSync('dist/data/videos.json', 'utf8'));
  const urls = [HOST + '/', HOST + '/categories', HOST + '/models', HOST + '/cowgirl'];
  for (const v of vids.slice(0, 600)) urls.push(HOST + '/watch/' + v.id);
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'sadcowgirl.fun', key: KEY, keyLocation: HOST + '/' + KEY + '.txt', urlList: urls }),
  });
  console.log('[indexnow] sadcowgirl:', urls.length, 'urls -> HTTP', r.status);
  process.exit(0);
})();