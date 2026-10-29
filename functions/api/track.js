// POST /api/track — public beacon endpoint. Records a visit row in D1.
const ALLOWED_KINDS = new Set(['view', 'watch', 'category', 'model', 'search', 'legal']);

function sha256(s) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then((b) =>
    [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

function deviceOf(ua) {
  if (/mobile|iphone|android/i.test(ua)) return 'Mobile';
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function browserOf(ua) {
  return /edg\//i.test(ua) ? 'Edge' : /opr\//i.test(ua) || /opera/i.test(ua) ? 'Opera'
    : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari' : 'Other';
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ ok: false, error: 'no-db' }, 500);
    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body.path === 'string' ? body.path.slice(0, 300) : '/';
    const path = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
    const kind = ALLOWED_KINDS.has(body.kind) ? body.kind : 'view';
    const videoId = typeof body.videoId === 'string' ? body.videoId.slice(0, 64) : null;
    let referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 300) : '';
    try {
      if (referrer) referrer = new URL(referrer).hostname;
    } catch { referrer = ''; }
    const ua = request.headers.get('User-Agent') || '';
    const country = request.headers.get('CF-IPCountry') || '';
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const visitor = ip ? (await sha256(ip + '|' + ua)).slice(0, 32) : '';

    await env.DB.prepare(
      `INSERT INTO visits (ts, path, video_id, kind, referrer, country, device, browser, visitor)
       VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(path, videoId, kind, referrer, country, deviceOf(ua), browserOf(ua), visitor).run();

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e).slice(0, 200) }, 500);
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}