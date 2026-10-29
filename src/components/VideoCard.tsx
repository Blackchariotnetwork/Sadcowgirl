import React, { useState } from 'react';
import { Play, Bookmark, Share2, Check } from 'lucide-react';
import { VideoItem } from '../types/video';
import { soundFX } from '../utils/audio';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isSavedInLasso: boolean;
  onToggleLasso: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  isSavedInLasso,
  onToggleLasso,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);

  // Simulated hover scrubbing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setScrubProgress(progress);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCheerClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#video=${video.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLasso = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCheerClick();
    onToggleLasso(video);
  };

  return (
    <div
      onClick={() => {
        soundFX.playWhistleChime();
        onSelect(video);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setScrubProgress(0);
      }}
      className="group flex flex-col bg-[#101726] border border-[#1E293B] hover:border-[#E07A5F]/70 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
    >
      {/* 16:9 Thumbnail Visual Container */}
      <div
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-video bg-[#0A0E18] overflow-hidden"
      >
        {/* Dynamic Collegiate Football / Rodeo Procedural Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${video.cardTheme.bgGradient} transition-transform duration-500 group-hover:scale-105`}
        >
          {/* Grid lines & yard marker pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 225">
            <line x1="50" y1="0" x2="50" y2="225" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 6" />
            <line x1="120" y1="0" x2="120" y2="225" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="200" y1="0" x2="200" y2="225" stroke="#E07A5F" strokeWidth="2" />
            <line x1="280" y1="0" x2="280" y2="225" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="350" y1="0" x2="350" y2="225" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 6" />
            {/* Horizontal Hash marks */}
            <line x1="0" y1="75" x2="400" y2="75" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 8" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 8" />
          </svg>

          {/* Central Themed Icon or Cowgirl Graphic */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm p-1.5 flex items-center justify-center mb-2 shadow-inner group-hover:border-[#E07A5F]/60 transition-colors">
              <img
                src="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png"
                alt="Sad Cowgirl"
                className="w-full h-full object-contain filter drop-shadow opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="font-varsity text-xs font-bold tracking-wider text-slate-300 uppercase text-center line-clamp-1">
              {video.cardTheme.stadiumTag}
            </span>
          </div>

          {/* Vignette / Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E18] via-transparent to-black/30" />
        </div>

        {/* Quality Tag Top Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] font-mono font-bold text-white border border-white/10">
          <span>{video.quality}</span>
        </div>

        {/* Quick Actions Overlay (Top Right) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleLasso}
            title={isSavedInLasso ? 'Remove from Lasso List' : 'Save to Lasso List'}
            className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${
              isSavedInLasso
                ? 'bg-[#E07A5F] text-white'
                : 'bg-black/70 hover:bg-black text-white hover:text-[#E07A5F]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSavedInLasso ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            title="Share clip link"
            className="p-1.5 rounded-md bg-black/70 hover:bg-black text-white hover:text-[#E07A5F] backdrop-blur-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Play Icon Center Pulse on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#E07A5F] text-white flex items-center justify-center shadow-lg shadow-black/80 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Duration Badge Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/85 backdrop-blur-sm rounded text-[11px] font-mono font-medium text-white shadow-sm">
          {video.duration}
        </div>

        {/* Simulated Hover Scrubber Bar */}
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className="h-full bg-[#E07A5F] transition-all duration-75"
              style={{ width: `${scrubProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          {/* Title */}
          <h3 className="font-varsity text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-[#E07A5F] transition-colors mb-2">
            {video.title}
          </h3>

          {/* Channel Info */}
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <span className="w-5 h-5 rounded-full bg-[#1A2338] border border-white/10 flex items-center justify-center text-xs shrink-0">
              {video.channel.avatar}
            </span>
            <span className="font-medium text-slate-300 truncate hover:text-white transition-colors">
              {video.channel.name}
            </span>
          </div>
        </div>

        {/* Zero-Pill Unboxed Metadata Line */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pt-2 border-t border-[#1E293B]/60">
          <span className="tabular-nums text-slate-400">{video.viewsFormatted} views</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{video.uploadDate}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-[#E07A5F] tabular-nums font-semibold">
            {video.likes > 1000 ? `${(video.likes / 1000).toFixed(1)}K` : video.likes} cheers
          </span>
        </div>
      </div>
    </div>
  );
};
