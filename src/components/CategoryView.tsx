import React, { useMemo, useState } from 'react';
import { ArrowLeft, Flame, Clock, Eye, ThumbsUp } from 'lucide-react';
import { SiteData } from '../data/siteData';
import { VideoGrid } from './VideoGrid';
import { VideoItem } from '../types/video';
import { soundFX } from '../utils/audio';

interface CategoryViewProps {
  data: SiteData;
  slug: string;
  onBack: () => void;
  lassoIds: Set<string>;
  onSelectVideo: (v: VideoItem) => void;
  onToggleLasso: (v: VideoItem) => void;
  /** Collection override (e.g. the Cowgirl corral) — bypasses category lookup. */
  override?: { title: string; subtitle: string; videos: VideoItem[] };
}

const PAGE_SIZE = 40;
type SortKey = 'views' | 'likes' | 'newest' | 'longest';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'views', label: 'Most Viewed' },
  { key: 'likes', label: 'Top Rated' },
  { key: 'newest', label: 'Newest' },
  { key: 'longest', label: 'Longest' },
];

export const CategoryView: React.FC<CategoryViewProps> = ({ data, slug, onBack, lassoIds, onSelectVideo, onToggleLasso, override }) => {
  const cat = override ? undefined : data.categories.find((c) => c.slug === slug);
  const [sort, setSort] = useState<SortKey>('views');
  const [page, setPage] = useState(0);

  const videos = useMemo(() => {
    if (override) return override.videos;
    const list = data.videos.filter((v) => v.category === (cat?.name || slug));
    const sorted = [...list];
    switch (sort) {
      case 'views': sorted.sort((a, b) => b.views - a.views); break;
      case 'likes': sorted.sort((a, b) => b.likes / (b.views || 1) - a.likes / (a.views || 1)); break;
      case 'newest': sorted.sort((a, b) => (b.uploadDate || '').localeCompare(a.uploadDate || '')); break;
      case 'longest': sorted.sort((a, b) => b.durationSec - a.durationSec); break;
    }
    return sorted;
  }, [data, cat, sort, override]);

  const pages = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = videos.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="py-4">
      <div className="mb-5 pb-4 border-b border-[#1E293B]">
        <button onClick={() => { soundFX.playCheerClick(); onBack(); }} className="text-xs font-mono text-slate-400 hover:text-[#E07A5F] flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> {override ? 'Back' : 'All Categories'}
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-varsity text-3xl font-bold text-white">{override?.title || cat?.name || slug}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#E07A5F] fill-[#E07A5F]" /> {videos.length} clips</span>
              {override ? (
                <span>{override.subtitle}</span>
              ) : (
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {((cat?.totalViews || 0) / 1e6).toFixed(1)}M views</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => { soundFX.playCheerClick(); setSort(s.key); setPage(0); }}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                  sort === s.key ? 'bg-[#E07A5F] text-white' : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {slice.length === 0 ? (
        <p className="text-sm text-slate-400 font-mono py-16 text-center">This corral is empty for now.</p>
      ) : (
        <VideoGrid videos={slice} lassoIds={lassoIds} onSelectVideo={onSelectVideo} onToggleLasso={onToggleLasso} />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button disabled={safePage === 0} onClick={() => { setPage(safePage - 1); window.scrollTo({ top: 0 }); }} className="px-3 py-1.5 text-xs font-mono rounded-md bg-[#141B2D] text-slate-300 disabled:opacity-40 hover:text-white">Prev</button>
          <span className="text-xs font-mono text-slate-400">Page {safePage + 1} / {pages}</span>
          <button disabled={safePage >= pages - 1} onClick={() => { setPage(safePage + 1); window.scrollTo({ top: 0 }); }} className="px-3 py-1.5 text-xs font-mono rounded-md bg-[#141B2D] text-slate-300 disabled:opacity-40 hover:text-white">Next</button>
        </div>
      )}
    </div>
  );
};

// Re-export icons used elsewhere to avoid unused import lint noise.
export { Clock, ThumbsUp };