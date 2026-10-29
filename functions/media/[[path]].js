// GET /media/<file> — serves images from the sadcowgirl-media R2 bucket.
// Functions take precedence over static assets, so this shadows public/media
// once the static copy is removed from the deploy.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  if (!key || key.includes('..')) return new Response('not found', { status: 404 });

  if (!env.MEDIA) {
    // R2 binding not configured yet — fall through to a 404 so callers notice.
    return new Response('r2 not bound', { status: 404 });
  }

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('access-control-allow-origin', '*');
  return new Response(obj.body, { status: 200, headers });
}