// Catch-all SEO layer. Static assets win first; this handles everything else.
// - Bots (Googlebot etc.) get a fully server-rendered HTML page built from the
//   dataset JSON — real crawlable content for /c/:slug, /m/:slug, /watch/:id.
// - Humans get the SPA (index.html) with per-path <title>/meta/canonical injected.
const SITE = 'sadcowgirl.fun';
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|discordbot|telegrambot|whatsapp|curl|wget|headless/i;

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Adsterra popunder — zone 31997484, DOMAIN-BOUND to sadcowgirl.fun (never reuse
// another site's zone). Injected into the human SPA response so it runs as a
// first-party script on every page load (the React app must not re-add it).
const AD_POPUNDER_SRC = 'https://unprofessionalginger.com/35/e5/d5/35e5d53b87a5de76ce8f59cc8f6de86f.js';
const AD_POPUNDER_TAG = '<script src="' + AD_POPUNDER_SRC + '"></scr' + 'ipt>';

// Shared no-store header for every HTML response (used by render() below —
// it was previously scoped inside onRequestGet, which made render() throw
// ReferenceError on every request and silently fall back to the raw SPA).
const HTML_NO_CACHE = { 'cache-control': 'no-store, must-revalidate' };

function fmtViews(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

function shell(title, desc, canonical, body, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png">
${extraHead}
<style>
body{margin:0;background:#080C14;color:#F3F4F6;font-family:system-ui,sans-serif}
a{color:inherit;text-decoration:none}
header{border-bottom:1px solid #1E293B;padding:14px 24px;display:flex;gap:24px;align-items:center}
header .brand{font-weight:800;letter-spacing:.06em}
header nav a{color:#cbd5e1;font-size:13px;margin-right:16px}
main{max-width:1440px;margin:0 auto;padding:24px}
h1{font-size:24px;margin:0 0 6px}
.sub{color:#94a3b8;font-size:12px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.card{background:#101726;border:1px solid #1E293B;border-radius:10px;overflow:hidden}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.card .t{padding:10px;font-size:13px;font-weight:600;line-height:1.35}
.card .m{padding:0 10px 10px;color:#94a3b8;font-size:11px}
footer{border-top:1px solid #1E293B;padding:20px 24px;color:#64748b;font-size:11px}
footer nav a{margin-right:14px;color:#94a3b8}
</style></head><body>
<header><span class="brand">sadcowgirl<span style="color:#E07A5F">.fun</span></span>
<nav><a href="/">Home</a><a href="/cowgirl">Cowgirl</a><a href="/categories">Categories</a><a href="/models">Models</a></nav></header>
<main>${body}</main>
<footer>© ${new Date().getFullYear()} ${SITE} · 18+ only ·
<a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a><a href="/legal/dmca">DMCA</a><a href="/legal/2257">2257</a></footer>
</body></html>`;
}

function videoGrid(videos, base) {
  return `<div class="grid">${videos.map((v) => `<a class="card" href="${base}/watch/${esc(v.id)}">
${v.thumbUrl ? `<img src="${esc(v.thumbUrl)}" alt="${esc(v.title)}" loading="lazy">` : ''}
<div class="t">${esc(v.title)}</div>
<div class="m">${esc(v.models?.[0] || 'Unknown')} · ${fmtViews(v.views)} views · ${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}</div>
</a>`).join('\n')}</div>`;
}

export async function onRequestGet({ request, env }) {
  // Static assets win: /data/*.json, /assets/*, robots.txt, sitemap.xml
  // (but never swallow the root HTML page — it needs meta injection)
  try {
    const asset = await env.ASSETS.fetch(request);
    const ctype = asset.headers.get('content-type') || '';
    if (asset.status !== 404 && !ctype.includes('text/html')) return asset;
  } catch { /* fall through to SPA handling */ }
  const HTML_NO_CACHE = { 'cache-control': 'no-store, must-revalidate' };

  try {
    return await render(request, env);
  } catch (e) {
    console.error('[render failed]', request.url, e && e.stack || String(e));
    // Never take the site down: fall back to the raw SPA
    try {
      const spa = await env.ASSETS.fetch(new Request(new URL(request.url).origin + '/index.html'));
      if (spa.status !== 404) return spa;
    } catch { /* ignore */ }
    return new Response('error', { status: 500 });
  }
}

async function render(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const canonical = `${url.origin}${path === '/' ? '/' : path}`;
  const isBot = BOT_RE.test(request.headers.get('User-Agent') || '');

  const fetchJson = async (name) => {
    try {
      const r = await env.ASSETS.fetch(new Request(`${url.origin}/data/${name}`));
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  };

  let title = 'sadcowgirl.fun — The Wildest Cowgirl Tube on the Range';
  let desc = 'Thousands of HD videos across dozens of categories — fresh amateurs, legendary riders, and everything in between. 18+ only.';
  let body = '';
  let extraHead = '';

  if (path === '/') {
    if (isBot) {
      const videos = (await fetchJson('videos.json')) || [];
      const cats = (await fetchJson('categories.json')) || [];
      const top = videos.slice(0, 60);
      body = `<h1>sadcowgirl.fun — free HD videos, updated daily</h1>
<p class="sub">${fmtViews(videos.reduce((s, v) => s + (v.views || 0), 0))} aggregate views · ${cats.length} categories · ${videos.length} videos</p>
<div class="grid">${cats.map((c) => `<a class="card" href="/c/${esc(c.slug)}"><div class="t">${esc(c.name)}</div><div class="m">${c.videoCount}+ clips</div></a>`).join('\n')}</div>
<h1 style="margin-top:28px">Most viewed this week</h1>
${videoGrid(top)}`;
    }
  } else if (path === '/categories' || path === '/cowgirl' || path === '/models') {
    const label = path === '/categories' ? 'All Categories' : path === '/cowgirl' ? 'The Cowgirl Corral' : 'The Corral — Models';
    title = `${label} — ${SITE}`;
    desc = `Browse ${label.toLowerCase()} on sadcowgirl.fun. Thousands of HD videos, 18+.`;
    if (isBot) {
      if (path === '/models') {
        const models = (await fetchJson('models.json')) || [];
        body = `<h1>${label}</h1><p class="sub">${models.length} riders</p>
<div class="grid">${models.map((m) => `<a class="card" href="/m/${esc(m.slug)}">
${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : ''}
<div class="t">${esc(m.name)}</div><div class="m">${m.videoIds.length} clips · ${fmtViews(m.totalViews)} views</div></a>`).join('\n')}</div>`;
      } else {
        const videos = (await fetchJson('videos.json')) || [];
        const cats = (await fetchJson('categories.json')) || [];
        const pool = path === '/cowgirl' ? videos.filter((v) => v.cowgirl) : videos;
        body = path === '/categories'
          ? `<h1>${label}</h1><p class="sub">${cats.length} categories</p>
<div class="grid">${cats.map((c) => `<a class="card" href="/c/${esc(c.slug)}"><div class="t">${esc(c.name)}</div><div class="m">${c.videoCount}+ clips · ${fmtViews(c.totalViews)} views</div></a>`).join('\n')}</div>`
          : `<h1>${label}</h1><p class="sub">${pool.length} clips</p>${videoGrid(pool.slice(0, 60))}`;
      }
    }
  } else if (path.startsWith('/c/')) {
    const slug = decodeURIComponent(path.slice(3));
    const cats = (await fetchJson('categories.json')) || [];
    const cat = cats.find((c) => c.slug === slug);
    const videos = (await fetchJson('videos.json')) || [];
    const pool = videos.filter((v) => v.category === (cat?.name || slug)).slice(0, 60);
    title = cat ? `${cat.name} Porn Videos — ${SITE}` : `${slug} — ${SITE}`;
    desc = `Watch the best ${cat?.name || slug} videos on sadcowgirl.fun. ${cat?.videoCount || pool.length}+ HD clips, sorted by views. 18+ only.`;
    extraHead = `<meta property="og:image" content="${url.origin}${esc(pool[0]?.thumbUrl || '')}">`;
    if (isBot) {
      body = `<h1>${esc(cat?.name || slug)} videos</h1><p class="sub">${cat?.videoCount || pool.length}+ clips</p>${videoGrid(pool)}`;
    }
  } else if (path.startsWith('/m/')) {
    const slug = decodeURIComponent(path.slice(3));
    const models = (await fetchJson('models.json')) || [];
    const videos = (await fetchJson('videos.json')) || [];
    const model = models.find((m) => m.slug === slug);
    const pool = model ? videos.filter((v) => model.videoIds.includes(v.id)).slice(0, 60) : [];
    title = model ? `${model.name} — Videos & Photos — ${SITE}` : `${slug} — ${SITE}`;
    desc = model ? `Watch ${model.name}'s videos on sadcowgirl.fun. ${model.videoIds.length} HD clips and photo galleries. 18+ only.` : `Model profile on ${SITE}.`;
    extraHead = model?.photo ? `<meta property="og:image" content="${url.origin}${esc(model.photo)}">` : '';
    if (isBot) {
      body = `<h1>${esc(model?.name || slug)}</h1><p class="sub">${model?.videoIds.length || 0} clips</p>${videoGrid(pool)}`;
    }
  } else if (path.startsWith('/watch/')) {
    const id = decodeURIComponent(path.slice(7));
    const videos = (await fetchJson('videos.json')) || [];
    const v = videos.find((x) => x.id === id);
    if (v) {
      title = `${v.title} — ${SITE}`;
      desc = `Watch ${v.title} on sadcowgirl.fun. Featuring ${v.models.join(', ') || 'unknown'}. ${v.tags.join(', ')}. 18+ only.`;
      extraHead = v.thumbUrl ? `<meta property="og:image" content="${url.origin}${esc(v.thumbUrl)}">
<link rel="video_src" href="${esc(v.embed)}">` : '';
      if (isBot) {
        const ld = {
          '@context': 'https://schema.org', '@type': 'VideoObject',
          name: v.title, description: desc, thumbnailUrl: v.thumbUrl ? `${url.origin}${v.thumbUrl}` : undefined,
          embedUrl: v.embed, uploadDate: v.upload || undefined,
          interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/WatchAction', userInteractionCount: v.views },
        };
        extraHead += `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
        body = `<h1>${esc(v.title)}</h1><p class="sub">${esc(v.models.join(', '))} · ${fmtViews(v.views)} views · ${esc(v.upload || '')}</p>
${v.thumbUrl ? `<img src="${esc(v.thumbUrl)}" alt="${esc(v.title)}" style="max-width:640px;width:100%;border-radius:10px">` : ''}
<p style="max-width:640px">This video plays on sadcowgirl.fun. Browse <a href="/c/${esc(esc((v.categories[0] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')))}">more ${esc(v.categories[0] || '')} videos</a>.</p>
<h1 style="margin-top:24px">More like this</h1>${videoGrid(videos.filter((x) => x.category === v.category && x.id !== v.id).slice(0, 24))}`;
      }
    }
  } else if (path.startsWith('/legal/')) {
    const slug = path.slice(7);
    const names = { terms: 'Terms of Service', privacy: 'Privacy Policy', dmca: 'DMCA / Copyright', '2257': '18 U.S.C. 2257 Statement' };
    title = `${names[slug] || slug} — ${SITE}`;
    desc = `${names[slug] || 'Legal information'} for sadcowgirl.fun.`;
  }

  // Serve the SPA for humans (with injected meta), or the SSR page for bots.
  const spa = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
  if (!isBot) {
    let html = await spa.text();
    html = html
      .replace(/<\/head>/i, AD_POPUNDER_TAG + '</head>')
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${esc(desc)}">`)
      .replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${esc(desc)}">`)
      .replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${esc(title)}">`)
      .replace(/<\/head>/i, `<link rel="canonical" href="${esc(canonical)}">${extraHead}</head>`);
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', ...HTML_NO_CACHE } });
  }

  return new Response(shell(title, desc, canonical, body, extraHead), {
    headers: { 'content-type': 'text/html; charset=utf-8', ...HTML_NO_CACHE },
  });
}