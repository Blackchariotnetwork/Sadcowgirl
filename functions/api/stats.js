// GET /api/stats?key=ADMIN_KEY&days=N — aggregates for the analytics dashboard.
const DAYS_ALLOWED = [1, 7, 30, 90];

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ error: 'unauthorized' }, 401);
  if (!env.DB) return json({ error: 'no-db' }, 500);

  const days = DAYS_ALLOWED.includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 7;
  const w = `WHERE ts >= datetime('now', '-${days} day')`;
  const db = env.DB;

  const q = async (sql) => (await db.prepare(sql).all()).results;
  const q1 = async (sql) => (await db.prepare(sql).first());

  const [visitsToday, pageviews, uniques, bestDay, countriesSeen, series, topCountries, topPages, topVideos, topCategories, referrers, devices, browsers, live] = await Promise.all([
    q1(`SELECT COUNT(*) c FROM visits WHERE ts >= datetime('now', '-1 day')`),
    q1(`SELECT COUNT(*) c FROM visits ${w}`),
    q1(`SELECT COUNT(DISTINCT visitor) c FROM visits ${w} AND visitor != ''`),
    q1(`SELECT date(ts) dd, COUNT(*) n FROM visits ${w} GROUP BY dd ORDER BY n DESC LIMIT 1`),
    q1(`SELECT COUNT(DISTINCT country) c FROM visits ${w} AND country != ''`),
    q(`SELECT date(ts) AS day, COUNT(*) n FROM visits ${w} GROUP BY day ORDER BY day`),
    q(`SELECT country AS code, COUNT(*) n FROM visits ${w} AND country != '' GROUP BY country ORDER BY n DESC LIMIT 10`),
    q(`SELECT path, COUNT(*) n FROM visits ${w} GROUP BY path ORDER BY n DESC LIMIT 10`),
    q(`SELECT video_id AS id, COUNT(*) n FROM visits ${w} AND video_id IS NOT NULL GROUP BY video_id ORDER BY n DESC LIMIT 12`),
    q(`SELECT path, COUNT(*) n FROM visits ${w} AND kind = 'category' GROUP BY path ORDER BY n DESC LIMIT 10`),
    q(`SELECT CASE WHEN referrer = '' THEN '(direct)' ELSE referrer END AS src, COUNT(*) n FROM visits ${w} GROUP BY src ORDER BY n DESC LIMIT 10`),
    q(`SELECT device, COUNT(*) n FROM visits ${w} GROUP BY device ORDER BY n DESC`),
    q(`SELECT browser, COUNT(*) n FROM visits ${w} GROUP BY browser ORDER BY n DESC`),
    q(`SELECT ts, path, kind, country, device, referrer FROM visits WHERE ts >= datetime('now', '-15 minutes') ORDER BY ts DESC, id DESC LIMIT 20`),
  ]);

  return json({
    days,
    visits_today: visitsToday?.c ?? 0,
    pageviews: pageviews?.c ?? 0,
    uniques: uniques?.c ?? 0,
    best_day: bestDay?.n ?? 0,
    countries_seen: countriesSeen?.c ?? 0,
    series,
    top_countries: topCountries,
    top_pages: topPages,
    top_videos: topVideos,
    top_categories: topCategories,
    referrers,
    devices,
    browsers,
    live,
  });
}