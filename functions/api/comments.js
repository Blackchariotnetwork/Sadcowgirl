// GET /api/comments?video=<id>  — latest comments for a video (public)
// POST /api/comments {videoId, name, text} — public, basic rate-limited
// DELETE /api/comments?id=<n> — admin key only (moderation)
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

const NAME_RE = /^[^<>{}]{1,32}$/;

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: 'no-db' }, 500);
  const url = new URL(request.url);
  const video = (url.searchParams.get('video') || '').slice(0, 64);
  if (!video) return json({ error: 'missing video' }, 400);
  const rows = (await env.DB.prepare(
    'SELECT id, name, text, likes, ts FROM comments WHERE video_id = ? ORDER BY id DESC LIMIT 50'
  ).bind(video).all()).results;
  return json({ comments: rows });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'no-db' }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const videoId = String(body.videoId || '').slice(0, 64);
  const name = String(body.name || '').trim() || 'Anonymous Rancher';
  const text = String(body.text || '').trim();
  if (!videoId) return json({ error: 'missing videoId' }, 400);
  if (!NAME_RE.test(name)) return json({ error: 'invalid name' }, 400);
  if (text.length < 2 || text.length > 500) return json({ error: 'comment must be 2-500 chars' }, 400);

  // Basic rate limit: 1 comment per visitor per minute.
  const ip = request.headers.get('CF-Connecting-IP') || 'x';
  const ua = request.headers.get('User-Agent') || '';
  const visitor = (await sha256(ip + '|' + ua)).slice(0, 32);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) c FROM comments WHERE ip_hash = ? AND ts >= datetime('now', '-1 minute')"
  ).bind(visitor).first();
  if (recent?.c > 0) return json({ error: 'Slow down, cowboy — one comment per minute.' }, 429);

  const r = await env.DB.prepare(
    "INSERT INTO comments (video_id, name, text, ip_hash) VALUES (?, ?, ?, ?)"
  ).bind(videoId, name, text, visitor).run();
  return json({ ok: true, id: r.meta?.last_row_id, name, text, likes: 0, ts: new Date().toISOString() });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'unauthorized' }, 401);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ error: 'missing id' }, 400);
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return json({ ok: true });
}