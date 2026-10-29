import React from 'react';
import { X, Trash2, Play, Bookmark } from 'lucide-react';
import { VideoItem } from '../types/video';
import { soundFX } from '../utils/audio';

interface LassoListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onRemoveVideo: (videoId: string) => void;
  onClearAll: () => void;
}

export const LassoListDrawer: React.FC<LassoListDrawerProps> = ({
  isOpen,
  onClose,
  savedVideos,
  onSelectVideo,
  onRemoveVideo,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0B0F19] border-l border-[#1E293B] h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B] bg-[#0E1524]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-[#E07A5F] fill-[#E07A5F]" />
            <div>
              <h3 className="font-varsity text-lg font-bold text-white tracking-wide">
                My Lasso List
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                {savedVideos.length} {savedVideos.length === 1 ? 'Reel' : 'Reels'} Saved for Later
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-[#141B2D] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Actions */}
        {savedVideos.length > 0 && (
          <div className="px-5 py-3 bg-[#111827] border-b border-[#1E293B] flex items-center justify-between">
            <button
              onClick={() => {
                soundFX.playWhistleChime();
                onSelectVideo(savedVideos[0]);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E07A5F] hover:bg-[#C25D42] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 font-mono transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {savedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#141B2D] border border-[#1E293B] flex items-center justify-center mb-3">
                <Bookmark className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="font-varsity text-base font-bold text-slate-300">
                Your Lasso List is Empty
              </h4>
              <p className="text-xs text-slate-500 font-body mt-1 max-w-xs">
                Click the bookmark icon on any clip across the 5 stadium rows to save it here for game day.
              </p>
            </div>
          ) : (
            savedVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-3 p-2.5 bg-[#101726] hover:bg-[#162033] rounded-xl border border-[#1E293B] transition-colors group"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    onSelectVideo(video);
                    onClose();
                  }}
                  className="w-24 aspect-video rounded-lg overflow-hidden bg-black relative shrink-0 cursor-pointer"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${video.cardTheme.bgGradient} flex items-center justify-center`}
                  >
                    <Play className="w-4 h-4 text-white/80 group-hover:text-[#E07A5F] transition-colors" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 text-white px-1 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-grow">
                  <h5
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="font-varsity text-xs font-bold text-slate-200 hover:text-[#E07A5F] cursor-pointer line-clamp-2 transition-colors"
                  >
                    {video.title}
                  </h5>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {video.channel.name} · {video.viewsFormatted}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveVideo(video.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-[#1E293B] transition-colors"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
