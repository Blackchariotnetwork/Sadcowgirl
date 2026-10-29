import React from 'react';
import { ChevronRight, Flame } from 'lucide-react';
import { CategoryInfo, SiteData } from '../data/siteData';
import { VideoItem } from '../types/video';
import { soundFX } from '../utils/audio';

interface CategoriesViewProps {
  data: SiteData;
  onSelectCategory: (slug: string) => void;
  lassoIds: Set<string>;
  onSelectVideo: (v: VideoItem) => void;
}

const fmtViews = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));

export const CategoriesView: React.FC<CategoriesViewProps> = ({ data, onSelectCategory }) => {
  const byCategory = new Map<string, VideoItem[]>();
  for (const v of data.videos) {
    for (const c of v.category ? [v.category] : []) {
      if (!byCategory.has(c)) byCategory.set(c, []);
      byCategory.get(c)!.push(v);
    }
  }
  return (
    <div className="py-4">
      <div className="mb-6 pb-4 border-b border-[#1E293B]">
        <h2 className="font-varsity text-3xl font-bold text-white flex items-center gap-3">
          <Flame className="w-7 h-7 text-[#E07A5F]" /> All Categories
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1.5">
          {data.categories.length} corrals &middot; {fmtViews(data.categories.reduce((s, c) => s + c.totalViews, 0))} total views across the ranch
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.categories.map((cat, i) => {
          const vids = (byCategory.get(cat.name) || []).filter((v) => v.thumbUrl);
          const tiles = vids.slice(0, 4);
          return (
            <button
              key={cat.slug}
              onClick={() => { soundFX.playCheerClick(); onSelectCategory(cat.slug); }}
              className="group text-left bg-[#101726] border border-[#1E293B] hover:border-[#E07A5F]/70 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#0A0E18]">
                {tiles.length >= 4 ? (
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-px bg-[#0A0E18]">
                    {tiles.map((t) => (
                      <img key={t.id} src={t.thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                    ))}
                  </div>
                ) : tiles.length > 0 ? (
                  <img src={tiles[0].thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#3B2A50] to-[#0E1526]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E18] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                  <span className="font-varsity text-sm font-bold tracking-wide text-white uppercase drop-shadow line-clamp-1">
                    {cat.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#E07A5F] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-300">{cat.videoCount >= 60 ? '60' : cat.videoCount}+ clips</span>
                <span className="text-[11px] font-mono text-[#E07A5F] flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-[#E07A5F]" /> {fmtViews(cat.totalViews)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};