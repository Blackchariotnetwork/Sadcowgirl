import React from 'react';
import { Users, Flame } from 'lucide-react';
import { SiteData } from '../data/siteData';
import { soundFX } from '../utils/audio';

interface ModelsViewProps {
  data: SiteData;
  onSelectModel: (slug: string) => void;
}

const fmtViews = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));

export const ModelsView: React.FC<ModelsViewProps> = ({ data, onSelectModel }) => {
  const modelsWithVideos = data.models.filter((m) => m.videoIds.length > 0);
  return (
    <div className="py-4">
      <div className="mb-6 pb-4 border-b border-[#1E293B]">
        <h2 className="font-varsity text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-[#E07A5F]" /> The Corral — Models
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1.5">
          {modelsWithVideos.length} riders &middot; ranked by total stadium views
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {modelsWithVideos.map((m) => (
          <button
            key={m.slug}
            onClick={() => { soundFX.playCheerClick(); onSelectModel(m.slug); }}
            className="group text-left bg-[#101726] border border-[#1E293B] hover:border-[#E07A5F]/70 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-b from-[#1B2340] to-[#0A0E18] overflow-hidden">
              {m.photo ? (
                <img src={m.photo} alt={m.name} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-varsity text-4xl text-white/20">
                  {m.name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E18] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className="font-varsity text-xs font-bold text-white uppercase line-clamp-1 block drop-shadow">{m.name}</span>
              </div>
            </div>
            <div className="px-2.5 py-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-300">{m.videoIds.length} clips</span>
              <span className="text-[10px] font-mono text-[#E07A5F] flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-[#E07A5F]" /> {fmtViews(m.totalViews)}
              </span>
            </div>
          </button>
        ))}
      </div>
      {modelsWithVideos.length === 0 && (
        <p className="text-sm text-slate-400 font-mono py-16 text-center">No riders in the corral yet.</p>
      )}
    </div>
  );
};