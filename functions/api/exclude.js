// GET /api/exclude?key=ADMIN_KEY
// Registers the CALLER's IP+UA hash as an excluded visitor (owner's own
// devices / test traffic) and purges their existing rows from analytics.
// Open this URL once from every device/browser that should stop being counted.
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'unauthorized' }, 401);
  if (!env.DB) return json({ error: 'no-db' }, 500);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const visitor = ip ? (await sha256(ip + '|' + ua)).slice(0, 32) : '';
  if (!visitor) return json({ error: 'no ip detected' }, 400);

  await env.DB.prepare('INSERT OR IGNORE INTO excluded_visitors (visitor, note) VALUES (?, ?)')
    .bind(visitor, url.searchParams.get('note') || '').run();
  const purged = await env.DB.prepare('DELETE FROM visits WHERE visitor = ?').bind(visitor).run();

  const count = await env.DB.prepare('SELECT COUNT(*) c FROM excluded_visitors').first();
  return json({ ok: true, ip, visitor, purged_rows: purged?.meta?.changes ?? 0, total_excluded: count?.c ?? 1 });
}