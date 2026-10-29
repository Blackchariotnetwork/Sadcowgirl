import React, { useEffect, useState, useCallback } from 'react';
import { Activity, BarChart3, Eye, Globe, Flame, Monitor, RefreshCw, Link2, PlayCircle, TrendingUp } from 'lucide-react';

interface Stats {
  days: number;
  visits_today: number;
  pageviews: number;
  uniques: number;
  best_day: number;
  countries_seen: number;
  series: { day: string; n: number }[];
  top_countries: { code: string; n: number }[];
  top_pages: { path: string; n: number }[];
  top_videos: { id: string; n: number }[];
  top_categories: { path: string; n: number }[];
  referrers: { src: string; n: number }[];
  devices: { device: string; n: number }[];
  browsers: { browser: string; n: number }[];
  live: { ts: string; path: string; kind: string; country: string; device: string; referrer: string }[];
}

const RANGES = [1, 7, 30, 90];

function flagOf(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n));

function Card({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string | number; note?: string }) {
  return (
    <div className="bg-[#101726] border border-[#1E293B] border-t-2 border-t-[#E07A5F] rounded-lg p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
        {icon} {label}
      </div>
      <div className="font-varsity text-3xl font-bold text-white mt-1.5 tabular-nums">{value}</div>
      {note && <div className="text-[11px] font-mono text-slate-500 mt-1">{note}</div>}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-3">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function BarRow({ label, n, max, right }: { label: React.ReactNode; n: number; max: number; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-xs">
      <div className="w-36 sm:w-44 shrink-0 truncate text-slate-300" title={typeof label === 'string' ? label : undefined}>{label}</div>
      <div className="flex-1 h-2.5 bg-[#0A0E18] rounded-sm overflow-hidden">
        <div className="h-full bg-[#E07A5F] min-w-[2px]" style={{ width: `${Math.max(2, (n / (max || 1)) * 100)}%` }} />
      </div>
      <div className="w-14 text-right font-mono tabular-nums text-slate-400">{right ?? fmt(n)}</div>
    </div>
  );
}

export const AnalyticsView: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [videosIndex, setVideosIndex] = useState<Map<string, { title: string; thumb?: string }>>(new Map());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?key=${encodeURIComponent(apiKey)}&days=${days}`);
      if (res.status === 401) { setError('Invalid admin key.'); return; }
      if (!res.ok) { setError(`Stats API error ${res.status}`); return; }
      setStats(await res.json());
      setError(null);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(String(e));
    }
  }, [apiKey, days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Titles/thumbs for top videos
  useEffect(() => {
    fetch('/data/videos.json')
      .then((r) => r.json())
      .then((vids: { id: string; title: string; thumbUrl?: string }[]) => {
        setVideosIndex(new Map(vids.map((v) => [v.id, { title: v.title, thumb: v.thumbUrl }])));
      })
      .catch(() => {});
  }, []);

  if (!apiKey || error) {
    return (
      <div className="py-20 text-center">
        <p className="font-varsity text-xl font-bold text-white">Restricted Corral</p>
        <p className="text-xs font-mono text-slate-400 mt-2">{error || 'An admin key is required.'}</p>
        <p className="text-xs font-mono text-slate-600 mt-4">Use: sadcowgirl.fun/#/admin?key=YOUR_KEY</p>
      </div>
    );
  }

  const maxSeries = stats ? Math.max(...stats.series.map((s) => s.n), 1) : 1;
  const topVideoMax = stats ? Math.max(...stats.top_videos.map((v) => v.n), 1) : 1;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-[#1E293B] flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-varsity text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-[#E07A5F]" /> Ranch Analytics
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1.5">
            Traffic control booth &middot; {updatedAt && <>updated {updatedAt} &middot; auto-refresh 30s</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                days === r ? 'bg-[#E07A5F] text-white' : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {r}d
            </button>
          ))}
          <button onClick={load} className="p-1.5 rounded-md bg-[#141B2D] text-slate-300 hover:text-white" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!stats ? (
        <p className="text-sm font-mono text-slate-500 py-20 text-center">Loading the stat sheet&hellip;</p>
      ) : (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card icon={<Activity className="w-3 h-3" />} label="Visits (24h)" value={fmt(stats.visits_today)} />
            <Card icon={<Eye className="w-3 h-3" />} label={`Pageviews (${days}d)`} value={fmt(stats.pageviews)} />
            <Card icon={<Flame className="w-3 h-3" />} label={`Uniques (${days}d)`} value={fmt(stats.uniques)} />
            <Card icon={<BarChart3 className="w-3 h-3" />} label="Best Day" value={fmt(stats.best_day)} note="most views in a single day" />
            <Card icon={<Globe className="w-3 h-3" />} label="Countries" value={stats.countries_seen} note={`in last ${days}d`} />
          </div>

          {/* Traffic chart */}
          <Panel title={`Visits / Day — last ${days}d`} icon={<BarChart3 className="w-3 h-3" />}>
            <div className="flex items-end gap-1 h-32">
              {stats.series.length === 0 && <p className="text-xs font-mono text-slate-500">No traffic yet.</p>}
              {stats.series.map((s) => (
                <div key={s.day} className="flex-1 flex flex-col items-center justify-end gap-1 group min-w-0" title={`${s.day}: ${s.n}`}>
                  <span className="text-[9px] font-mono text-[#E07A5F] opacity-0 group-hover:opacity-100 transition-opacity">{s.n}</span>
                  <div className="w-full bg-gradient-to-t from-[#5a2c20] to-[#E07A5F] rounded-t-sm" style={{ height: `${Math.max(3, (s.n / maxSeries) * 100)}%` }} />
                  <span className="text-[8px] font-mono text-slate-600 truncate w-full text-center">{s.day.slice(5)}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top videos */}
            <Panel title="Top Videos (watch events)" icon={<PlayCircle className="w-3 h-3" />}>
              {stats.top_videos.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-6 text-center">No watch events yet.</p>
              ) : (
                <div>
                  {stats.top_videos.map((v) => {
                    const meta = videosIndex.get(v.id);
                    return (
                      <div key={v.id} className="flex items-center gap-2.5 py-1.5 text-xs">
                        <div className="w-16 shrink-0 aspect-video rounded overflow-hidden bg-[#0A0E18] border border-[#1E293B]">
                          {meta?.thumb && <img src={meta.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 truncate text-slate-300">{meta?.title || v.id}</div>
                        <div className="w-14 text-right font-mono tabular-nums text-[#E07A5F]">{fmt(v.n)}</div>
                        <div className="w-20 h-2 bg-[#0A0E18] rounded-sm overflow-hidden hidden sm:block">
                          <div className="h-full bg-[#E07A5F]" style={{ width: `${(v.n / topVideoMax) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Countries */}
            <Panel title="Top Countries" icon={<Globe className="w-3 h-3" />}>
              {stats.top_countries.map((c) => (
                <BarRow key={c.code} label={<span>{flagOf(c.code)} {c.code}</span>} n={c.n} max={stats.top_countries[0]?.n || 1} />
              ))}
              {stats.top_countries.length === 0 && <p className="text-xs font-mono text-slate-500 py-6 text-center">No country data yet.</p>}
            </Panel>

            {/* Referrers */}
            <Panel title="Traffic Sources" icon={<Link2 className="w-3 h-3" />}>
              {stats.referrers.map((r) => (
                <BarRow key={r.src} label={r.src} n={r.n} max={stats.referrers[0]?.n || 1} />
              ))}
              {stats.referrers.length === 0 && <p className="text-xs font-mono text-slate-500 py-6 text-center">No referrer data yet.</p>}
            </Panel>

            {/* Devices & browsers */}
            <Panel title="Devices & Browsers" icon={<Monitor className="w-3 h-3" />}>
              {stats.devices.map((d) => (
                <BarRow key={d.device} label={d.device} n={d.n} max={stats.devices[0]?.n || 1} />
              ))}
              <div className="my-2 border-t border-[#1E293B]" />
              {stats.browsers.map((b) => (
                <BarRow key={b.browser} label={b.browser} n={b.n} max={stats.browsers[0]?.n || 1} />
              ))}
            </Panel>

            {/* Top categories */}
            <Panel title="Top Categories" icon={<Flame className="w-3 h-3" />}>
              {stats.top_categories.length === 0 && <p className="text-xs font-mono text-slate-500 py-6 text-center">No category visits yet.</p>}
              {stats.top_categories.map((c) => {
                const name = decodeURIComponent(c.path.replace('/#/c/', '').replace(/-/g, ' '));
                return <BarRow key={c.path} label={name} n={c.n} max={stats.top_categories[0]?.n || 1} />;
              })}
            </Panel>

            {/* Live feed */}
            <Panel title="Live Feed — last 15 min" icon={<Activity className="w-3 h-3" />}>
              {stats.live.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-6 text-center">Quiet in the corral right now.</p>
              ) : (
                <div className="font-mono text-[11px] space-y-1.5 max-h-72 overflow-y-auto">
                  {stats.live.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400 border-b border-[#1E293B]/50 pb-1.5">
                      <span className="text-slate-600">{l.ts.split(' ')[1]}</span>
                      <span>{flagOf(l.country)}</span>
                      <span className="px-1 rounded bg-[#141B2D] text-[#E07A5F] text-[9px] uppercase">{l.kind}</span>
                      <span className="truncate flex-1 text-slate-300">{l.path}</span>
                      <span className="text-slate-600 shrink-0">{l.device}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};