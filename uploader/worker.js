// One-way media uploader for sadcowgirl R2 migration.
// PUT /u/<key> with X-Admin-Key -> store object. GET /check/<key> -> exists?
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'PUT' && url.pathname.startsWith('/u/')) {
      if (req.headers.get('X-Admin-Key') !== env.ADMIN_KEY) {
        return new Response('unauthorized', { status: 401 });
      }
      const key = decodeURIComponent(url.pathname.slice(3));
      if (!/^[A-Za-z0-9_/.-]+\.(jpg|webp|png|txt)$/.test(key)) {
        return new Response('bad key', { status: 400 });
      }
      await env.MEDIA.put(key, req.body);
      return new Response('ok');
    }
    if (url.pathname.startsWith('/check/')) {
      const key = decodeURIComponent(url.pathname.slice(7));
      const obj = await env.MEDIA.head(key);
      return new Response(JSON.stringify({ exists: !!obj }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('sadcowgirl media uploader');
  },
};