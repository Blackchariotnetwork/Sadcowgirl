import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { VideoRow } from './components/VideoRow';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { LassoListDrawer } from './components/LassoListDrawer';
import { UploadModal } from './components/UploadModal';
import { Footer } from './components/Footer';
import { VIDEO_ROWS, INITIAL_VIDEOS } from './data/mockVideos';
import { VideoItem } from './types/video';
import { soundFX } from './utils/audio';
import { Search, Flame, Film } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('sadcowgirl_videos');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_VIDEOS;
  });

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [lassoIds, setLassoIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sadcowgirl_lasso_ids');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return new Set(['pt-1', 'rv-1']);
  });

  const [isLassoOpen, setIsLassoOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRowFilter, setActiveRowFilter] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sadcowgirl_lasso_ids', JSON.stringify(Array.from(lassoIds)));
    } catch {
      // ignore
    }
  }, [lassoIds]);

  useEffect(() => {
    try {
      localStorage.setItem('sadcowgirl_videos', JSON.stringify(videos));
    } catch {
      // ignore
    }
  }, [videos]);

  // Handle URL hash navigation for direct video links
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#video=')) {
        const id = hash.replace('#video=', '');
        const target = videos.find((v) => v.id === id);
        if (target) {
          setActiveVideo(target);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [videos]);

  const toggleLasso = (video: VideoItem) => {
    setLassoIds((prev) => {
      const next = new Set(prev);
      if (next.has(video.id)) {
        next.delete(video.id);
      } else {
        next.add(video.id);
      }
      return next;
    });
  };

  const handleClearLasso = () => {
    soundFX.playCheerClick();
    setLassoIds(new Set());
  };

  const handleAddVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
    setActiveVideo(newVideo);
  };

  const handleSelectNavRow = (rowId: string) => {
    setActiveRowFilter(rowId);
    const targetElement = document.getElementById(`row-${rowId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered videos based on search
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [videos, searchQuery]);

  // Saved videos list for Lasso List drawer
  const savedLassoVideos = useMemo(() => {
    return videos.filter((v) => lassoIds.has(v.id));
  }, [videos, lassoIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-[#E07A5F] selection:text-white">
      {/* Collegiate Top Navigation Bar */}
      <Navbar
        lassoCount={lassoIds.size}
        onOpenLassoList={() => setIsLassoOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeRowId={activeRowFilter}
        onSelectNavRow={handleSelectNavRow}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Stadium Channel Bar / Filter Strip */}
        <section className="border-b border-[#1E293B] bg-[#0B101C]/80 sticky top-[61px] z-30 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  soundFX.playCheerClick();
                  setActiveRowFilter(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap ${
                  activeRowFilter === null
                    ? 'bg-[#E07A5F] text-white shadow-sm'
                    : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                All 5 Rows
              </button>

              {VIDEO_ROWS.map((row) => {
                const isActive = activeRowFilter === row.id;
                return (
                  <button
                    key={row.id}
                    onClick={() => {
                      soundFX.playCheerClick();
                      handleSelectNavRow(row.id);
                    }}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#E07A5F] text-white shadow-sm'
                        : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    Row {row.index} · {row.title}
                  </button>
                );
              })}
            </div>

            {/* Quick Stats Indicator */}
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1 text-[#E07A5F]">
                <Flame className="w-3.5 h-3.5 fill-[#E07A5F]" />
                <span>28+ HD CLIPS ONLINE</span>
              </span>
              <span className="text-slate-600">|</span>
              <span>100% INDEPENDENT COWBOY TUBE</span>
            </div>
          </div>
        </section>

        {/* Container for the 5 Rows or Search Results */}
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
                    Found {filteredVideos.length} matching clip{filteredVideos.length === 1 ? '' : 's'} across the 5 rows
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
                    Try searching for &quot;quarterback&quot;, &quot;rodeo&quot;, &quot;brisket&quot;, &quot;halftime&quot;, or &quot;touchdown&quot;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        soundFX.playWhistleChime();
                        setActiveVideo(video);
                      }}
                      className="group flex flex-col bg-[#101726] border border-[#1E293B] hover:border-[#E07A5F]/70 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                    >
                      <div className="relative w-full aspect-video bg-[#0A0E18] overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-tr ${video.cardTheme.bgGradient} flex items-center justify-center`}>
                          <Film className="w-8 h-8 text-white/50 group-hover:text-[#E07A5F] transition-colors" />
                        </div>
                        <span className="absolute bottom-2 right-2 text-xs font-mono bg-black/85 text-white px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-3.5 flex flex-col flex-grow justify-between">
                        <div>
                          <h4 className="font-varsity text-sm font-bold text-slate-100 group-hover:text-[#E07A5F] line-clamp-2 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 font-mono">
                            {video.channel.name} · {video.viewsFormatted} views
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-[#E07A5F] mt-2 block">
                          Row: {video.rowName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* The 5 Themed Rows */
            <div>
              {VIDEO_ROWS.map((row) => {
                const rowVideos = videos.filter((v) => v.rowId === row.id);
                return (
                  <VideoRow
                    key={row.id}
                    rowConfig={row}
                    videos={rowVideos}
                    onSelectVideo={setActiveVideo}
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
      <Footer onSelectNavRow={handleSelectNavRow} />

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          isSavedInLasso={lassoIds.has(activeVideo.id)}
          onToggleLasso={toggleLasso}
          relatedVideos={videos.filter((v) => v.rowId === activeVideo.rowId)}
          onSelectVideo={setActiveVideo}
        />
      )}

      {/* Lasso List Drawer */}
      <LassoListDrawer
        isOpen={isLassoOpen}
        onClose={() => setIsLassoOpen(false)}
        savedVideos={savedLassoVideos}
        onSelectVideo={setActiveVideo}
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
