import React, { useMemo } from 'react';
import { ArrowLeft, Users, Flame, Eye, Clock } from 'lucide-react';
import { SiteData } from '../data/siteData';
import { VideoGrid } from './VideoGrid';
import { VideoItem } from '../types/video';
import { soundFX } from '../utils/audio';

interface ModelProfileProps {
  data: SiteData;
  slug: string;
  onBack: () => void;
  lassoIds: Set<string>;
  onSelectVideo: (v: VideoItem) => void;
  onToggleLasso: (v: VideoItem) => void;
}

const fmtViews = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));

export const ModelProfile: React.FC<ModelProfileProps> = ({ data, slug, onBack, lassoIds, onSelectVideo, onToggleLasso }) => {
  const model = data.models.find((m) => m.slug === slug);
  const videos = useMemo(() => {
    if (!model) return [];
    const ids = new Set(model.videoIds);
    return data.videos.filter((v) => ids.has(v.id)).sort((a, b) => b.views - a.views);
  }, [data, model]);

  if (!model) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-400 font-mono">Rider not found.</p>
        <button onClick={onBack} className="mt-4 text-xs font-mono text-[#E07A5F] hover:underline">Back to the corral</button>
      </div>
    );
  }

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const topPhotos = videos.filter((v) => v.thumbUrl).slice(0, 8).map((v) => v.thumbUrl!);

  return (
    <div className="py-4">
      <button onClick={() => { soundFX.playCheerClick(); onBack(); }} className="text-xs font-mono text-slate-400 hover:text-[#E07A5F] flex items-center gap-1 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> The Corral
      </button>

      {/* Hero banner: photo wall strip */}
      <div className="relative rounded-xl overflow-hidden border border-[#1E293B] mb-6">
        <div className="flex h-40 sm:h-56">
          {(topPhotos.length ? topPhotos : Array(6).fill('')).slice(0, 8).map((p, i) => (
            <div key={i} className="flex-1 min-w-0 bg-gradient-to-b from-[#1B2340] to-[#0A0E18]">
              {p && <img src={p} alt="" loading="lazy" className="w-full h-full object-cover opacity-70" />}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/40 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#E07A5F]/60 overflow-hidden bg-[#141B2D] shrink-0">
            {topPhotos[0] ? (
              <img src={topPhotos[0]} alt={model.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-varsity text-2xl text-white/40">{model.name.charAt(0)}</div>
            )}
          </div>
          <div>
            <h2 className="font-varsity text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#E07A5F]" /> {model.name}
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {fmtViews(totalViews)} views</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {videos.length} clips</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#E07A5F] fill-[#E07A5F]" /> Top rider</span>
            </p>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="text-sm text-slate-400 font-mono py-16 text-center">No clips from this rider yet.</p>
      ) : (
        <VideoGrid videos={videos} lassoIds={lassoIds} onSelectVideo={onSelectVideo} onToggleLasso={onToggleLasso} />
      )}
    </div>
  );
};