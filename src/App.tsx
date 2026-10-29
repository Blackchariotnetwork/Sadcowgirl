import { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VideoRow } from './components/VideoRow';
import { WatchModal } from './components/WatchModal';
import { LassoListDrawer } from './components/LassoListDrawer';
import { UploadModal } from './components/UploadModal';
import { Footer } from './components/Footer';
import { CategoriesView } from './components/CategoriesView';
import { CategoryView } from './components/CategoryView';
import { ModelsView } from './components/ModelsView';
import { ModelProfile } from './components/ModelProfile';
import { VideoGrid } from './components/VideoGrid';
import { LegalPage } from './components/LegalPages';
import { AnalyticsView } from './components/AnalyticsView';
import { loadSiteData, VIDEO_ROWS, SiteData } from './data/siteData';
import { VideoItem } from './types/video';
import { soundFX } from './utils/audio';
import { Search, Flame } from 'lucide-react';

type View =
  | { name: 'home' }
  | { name: 'categories' }
  | { name: 'category'; slug: string }
  | { name: 'models' }
  | { name: 'model'; slug: string }
  | { name: 'legal'; slug: string }
  | { name: 'cowgirl' }
  | { name: 'admin' };

function parseHash(): View {
  const h = window.location.hash;
  if (h.startsWith('#/categories')) return { name: 'categories' };
  if (h.startsWith('#/c/')) return { name: 'category', slug: decodeURIComponent(h.slice(4)) };
  if (h.startsWith('#/models')) return { name: 'models' };
  if (h.startsWith('#/m/')) return { name: 'model', slug: decodeURIComponent(h.slice(4)) };
  if (h.startsWith('#/legal/')) return { name: 'legal', slug: decodeURIComponent(h.slice(8)) };
  if (h.startsWith('#/admin')) return { name: 'admin' };
  if (h.startsWith('#/cowgirl')) return { name: 'cowgirl' };
  return { name: 'home' };
}

function viewToHash(v: View): string {
  switch (v.name) {
    case 'categories': return '#/categories';
    case 'category': return `#/c/${encodeURIComponent(v.slug)}`;
    case 'models': return '#/models';
    case 'model': return `#/m/${encodeURIComponent(v.slug)}`;
    case 'legal': return `#/legal/${encodeURIComponent(v.slug)}`;
    case 'admin': return '#/admin';
    case 'cowgirl': return '#/cowgirl';
    default: return '#/';
  }
}

function adminKey(): string {
  const h = window.location.hash;
  const qi = h.indexOf('?');
  if (qi > -1) return new URLSearchParams(h.slice(qi)).get('key') || '';
  return new URLSearchParams(window.location.search).get('key') || '';
}

function track(kind: string, path: string, videoId?: string) {
  try {
    const payload = JSON.stringify({ path, kind, videoId, referrer: document.referrer || '' });
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', blob);
    else fetch('/api/track', { method: 'POST', body: payload, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {
    // analytics must never break the page
  }
}

export default function App() {
  const [data, setData] = useState<SiteData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [view, setView] = useState<View>(() => parseHash());
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(() => {
    const hash = window.location.hash;
    return hash.startsWith('#video=') ? hash.replace('#video=', '') : null;
  });
  const [lassoIds, setLassoIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sadcowgirl_lasso_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set();
  });
  const [isLassoOpen, setIsLassoOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRowFilter, setActiveRowFilter] = useState<string | null>(null);
  const didOpenPending = useRef(false);

  // Load site data
  useEffect(() => {
    loadSiteData()
      .then(setData)
      .catch((e) => setDataError(String(e)));
  }, []);

  // Sync lasso to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sadcowgirl_lasso_ids', JSON.stringify(Array.from(lassoIds)));
    } catch {
      // ignore
    }
  }, [lassoIds]);

  // Hashchange navigation
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.startsWith('#video=')) return;
      setView(parseHash());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (v: View) => {
    setView(v);
    window.location.hash = viewToHash(v);
    window.scrollTo({ top: 0 });
  };

  // Analytics beacon on every view change
  useEffect(() => {
    if (view.name === 'admin') return;
    track(view.name === 'home' ? 'view' : view.name, viewToHash(view));
  }, [view]);

  // Deep-link video opening once data is ready
  useEffect(() => {
    if (!data || !pendingVideoId || didOpenPending.current) return;
    const target = data.videos.find((v) => v.id === pendingVideoId);
    if (target) {
      didOpenPending.current = true;
      setActiveVideo(target);
    }
    setPendingVideoId(null);
  }, [data, pendingVideoId]);

  // Handle URL hash navigation for direct video links
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#video=') || !data) return;
      const id = hash.replace('#video=', '');
      const target = data.videos.find((v) => v.id === id);
      if (target) setActiveVideo(target);
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [data]);

  const openVideo = (video: VideoItem) => {
    setActiveVideo(video);
    track('watch', viewToHash(view), video.id);
    window.history.replaceState(null, '', `#video=${video.id}`);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    if (window.location.hash.startsWith('#video=')) {
      window.history.replaceState(null, '', viewToHash(view));
    }
  };

  const toggleLasso = (video: VideoItem) => {
    setLassoIds((prev) => {
      const next = new Set(prev);
      if (next.has(video.id)) next.delete(video.id);
      else next.add(video.id);
      return next;
    });
  };

  const handleClearLasso = () => {
    soundFX.playCheerClick();
    setLassoIds(new Set());
  };

  const handleAddVideo = (newVideo: VideoItem) => {
    if (!data) return;
    setData({ ...data, videos: [newVideo, ...data.videos] });
    openVideo(newVideo);
  };

  const handleSelectNavRow = (rowId: string) => {
    if (view.name !== 'home') navigate({ name: 'home' });
    setActiveRowFilter(rowId);
    setTimeout(() => {
      const el = document.getElementById(`row-${rowId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleOpenModelByName = (name: string) => {
    const m = data?.models.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (m) {
      setActiveVideo(null);
      navigate({ name: 'model', slug: m.slug });
    }
  };

  // Filtered videos based on search
  const filteredVideos = useMemo(() => {
    if (!data || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return data.videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        (v.models || []).some((m) => m.toLowerCase().includes(q)) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const savedLassoVideos = useMemo(() => {
    return (data?.videos || []).filter((v) => lassoIds.has(v.id));
  }, [data, lassoIds]);

  const relatedFor = (video: VideoItem): VideoItem[] => {
    if (!data) return [];
    const sameCat = data.videos.filter((v) => v.id !== video.id && v.category === video.category);
    if (sameCat.length >= 6) return sameCat.sort((a, b) => b.views - a.views);
    const sameRow = data.videos.filter((v) => v.id !== video.id && v.rowId === video.rowId);
    return (sameCat.length ? [...sameCat, ...sameRow] : sameRow).sort((a, b) => b.views - a.views);
  };

  if (dataError) {
    return (
      <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="font-varsity text-xl font-bold">The corral gate is stuck</p>
        <p className="text-xs font-mono text-slate-400">Site data failed to load: {dataError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col items-center justify-center gap-4">
        <img
          src="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png"
          alt="sadcowgirl.fun"
          className="w-16 h-16 object-contain animate-pulse"
        />
        <p className="font-varsity text-sm font-bold tracking-widest text-slate-400 uppercase">Saddling up&hellip;</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-[#E07A5F] selection:text-white">
      {/* Collegiate Top Navigation Bar */}
      <Navbar
        lassoCount={lassoIds.size}
        onOpenLassoList={() => setIsLassoOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={view.name === 'category' || view.name === 'cowgirl' ? 'categories' : view.name === 'model' ? 'models' : view.name === 'legal' ? 'legal' : view.name}
        onNavigate={(id) => {
          if (id === 'home') navigate({ name: 'home' });
          else if (id === 'categories') navigate({ name: 'categories' });
          else if (id === 'models') navigate({ name: 'models' });
          else if (id === 'cowgirl') navigate({ name: 'cowgirl' });
          else if (id.startsWith('row:')) handleSelectNavRow(id.slice(4));
          else if (id.startsWith('legal:')) navigate({ name: 'legal', slug: id.slice(6) });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Stadium Channel Bar — home only */}
        {view.name === 'home' && (
          <section className="border-b border-[#1E293B] bg-[#0B101C]/80 sticky top-[61px] z-30 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    soundFX.playCheerClick();
                    setActiveRowFilter(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap bg-[#E07A5F] text-white shadow-sm"
                >
                  All Videos
                </button>

                {data.categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      soundFX.playCheerClick();
                      navigate({ name: 'category', slug: cat.slug });
                    }}
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Quick Stats Indicator */}
              <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
                <span className="flex items-center gap-1 text-[#E07A5F]">
                  <Flame className="w-3.5 h-3.5 fill-[#E07A5F]" />
                  <span>{data.videos.length}+ HD CLIPS ONLINE</span>
                </span>
                <span className="text-slate-600">|</span>
                <span>100% INDEPENDENT COWBOY TUBE</span>
              </div>
            </div>
          </section>
        )}

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {searchQuery ? (
            /* Search Results View */
            <div className="py-6">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1E293B]">
                <div>
                  <h2 className="font-varsity text-2xl font-bold text-white">
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Found {filteredVideos.length} matching clip{filteredVideos.length === 1 ? '' : 's'} across the ranch
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#E07A5F] hover:underline font-mono"
                >
                  Clear Search
                </button>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#141B2D] border border-[#1E293B] flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="font-varsity text-lg font-bold text-slate-200">
                    No Stadium Clips Matched &ldquo;{searchQuery}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Try a category, a rider&rsquo;s name, or a tag from the corral.
                  </p>
                </div>
              ) : (
                <VideoGrid
                  videos={filteredVideos}
                  lassoIds={lassoIds}
                  onSelectVideo={openVideo}
                  onToggleLasso={toggleLasso}
                />
              )}
            </div>
          ) : view.name === 'categories' ? (
            <CategoriesView
              data={data}
              onSelectCategory={(slug) => navigate({ name: 'category', slug })}
              lassoIds={lassoIds}
              onSelectVideo={openVideo}
            />
          ) : view.name === 'category' ? (
            <CategoryView
              data={data}
              slug={view.slug}
              onBack={() => navigate({ name: 'categories' })}
              lassoIds={lassoIds}
              onSelectVideo={openVideo}
              onToggleLasso={toggleLasso}
            />
          ) : view.name === 'models' ? (
            <ModelsView data={data} onSelectModel={(slug) => navigate({ name: 'model', slug })} />
          ) : view.name === 'model' ? (
            <ModelProfile
              data={data}
              slug={view.slug}
              onBack={() => navigate({ name: 'models' })}
              lassoIds={lassoIds}
              onSelectVideo={openVideo}
              onToggleLasso={toggleLasso}
            />
          ) : view.name === 'legal' ? (
            <LegalPage slug={view.slug} onBack={() => navigate({ name: 'home' })} />
          ) : view.name === 'admin' ? (
            <AnalyticsView apiKey={adminKey()} />
          ) : view.name === 'cowgirl' ? (
            <CategoryView
              data={data}
              slug="cowgirl"
              onBack={() => navigate({ name: 'home' })}
              lassoIds={lassoIds}
              onSelectVideo={openVideo}
              onToggleLasso={toggleLasso}
              override={{
                title: 'The Cowgirl Corral',
                subtitle: 'Every ride, roping and reverse-cowgirl classic we could lasso — ranked by views',
                videos: data.videos.filter((v) => v.cowgirl),
              }}
            />
          ) : (
            /* The 5 Themed Rows */
            <div>
              {VIDEO_ROWS.map((row) => {
                const rowVideos = data.videos.filter((v) => v.rowId === row.id);
                return (
                  <VideoRow
                    key={row.id}
                    rowConfig={row}
                    videos={rowVideos}
                    onSelectVideo={openVideo}
                    lassoIds={lassoIds}
                    onToggleLasso={toggleLasso}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Collegiate Footer */}
      <Footer onNavigate={(id) => {
        if (id.startsWith('row:')) handleSelectNavRow(id.slice(4));
        else if (id === 'categories') navigate({ name: 'categories' });
        else if (id === 'models') navigate({ name: 'models' });
        else if (id.startsWith('legal:')) navigate({ name: 'legal', slug: id.slice(6) });
      }} />

      {/* Video Watch Modal */}
      {activeVideo && (
        <WatchModal
          video={activeVideo}
          onClose={closeVideo}
          isSavedInLasso={lassoIds.has(activeVideo.id)}
          onToggleLasso={toggleLasso}
          relatedVideos={relatedFor(activeVideo)}
          onSelectVideo={openVideo}
          onOpenModel={handleOpenModelByName}
        />
      )}

      {/* Lasso List Drawer */}
      <LassoListDrawer
        isOpen={isLassoOpen}
        onClose={() => setIsLassoOpen(false)}
        savedVideos={savedLassoVideos}
        onSelectVideo={(v) => {
          setIsLassoOpen(false);
          openVideo(v);
        }}
        onRemoveVideo={(id) => {
          setLassoIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
        onClearAll={handleClearLasso}
      />

      {/* Upload Reel Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddVideo={handleAddVideo}
      />
    </div>
  );
}