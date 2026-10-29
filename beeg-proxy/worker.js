// beeg HLS proxy — their CDN 403s foreign referers, so we mint the signed URL
// and proxy playlists + segments through this worker with the right headers.
// GET /stream/beeg/{fileId}          -> master playlist (rewritten)
// GET /stream/beeg/{fileId}?u=<path> -> segment / variant playlist (proxied)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/stream\/beeg\/(\d+)$/);
    if (!m) return new Response('sadcowgirl beeg proxy', { status: 404, headers: CORS });
    const fileId = m[1];
    const seg = url.searchParams.get('u');
    const headers = { ...CORS };

    const beegFetch = (u) =>
      fetch(u, { headers: { 'User-Agent': env.BEEG_UA, Referer: 'https://beeg.com/' }, signal: AbortSignal.timeout(20000) });

    try {
      if (seg) {
        const upstream = await beegFetch(`https://video.beeg.com${seg}`);
        if (!upstream.ok) return new Response('upstream error', { status: 502, headers: CORS });
        const ct = upstream.headers.get('content-type') || 'application/octet-stream';
        if (/m3u8|mpegurl/i.test(ct) || seg.endsWith('.m3u8')) {
          headers['content-type'] = 'application/vnd.apple.mpegurl';
          headers['cache-control'] = 'no-store';
          return new Response(rewriteM3u8(await upstream.text(), fileId), { headers });
        }
        headers['content-type'] = ct;
        headers['cache-control'] = 'public, max-age=3600';
        return new Response(upstream.body, { headers });
      }

      // Master playlist: mint signed URL, fetch, rewrite
      const pr = await beegFetch(`https://store.externulls.com/video/play_url/${fileId}`);
      const playPath = (await pr.text()).trim();
      if (!pr.ok || !playPath.startsWith('key=')) return new Response('beeg resolver unavailable', { status: 502, headers: CORS });
      const master = await beegFetch(`https://video.beeg.com/${playPath}`);
      if (!master.ok) return new Response('beeg media unavailable', { status: 502, headers: CORS });
      headers['content-type'] = 'application/vnd.apple.mpegurl';
      headers['cache-control'] = 'no-store';
      return new Response(rewriteM3u8(await master.text(), fileId), { headers });
    } catch (e) {
      return new Response('proxy error: ' + String(e).slice(0, 120), { status: 502, headers: CORS });
    }
  },
};

function rewriteM3u8(text, fileId) {
  return text
    .split('\n')
    .map((line) => {
      const t = line.trim();
      const abs = t.match(/^https?:\/\/[a-z0-9.-]*video\.beeg\.com(\/key=.+)$/i);
      if (abs) return `/stream/beeg/${fileId}?u=${encodeURIComponent(abs[1])}`;
      if (t.startsWith('/key=')) return `/stream/beeg/${fileId}?u=${encodeURIComponent(t)}`;
      const uri = line.match(/URI="(\/key=[^"]+)"/);
      if (uri) return line.replace(uri[1], `/stream/beeg/${fileId}?u=${encodeURIComponent(uri[1])}`);
      return line;
    })
    .join('\n');
}