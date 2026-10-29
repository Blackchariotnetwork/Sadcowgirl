import React, { useState, useEffect, useRef } from 'react';
import { X, Bookmark, Share2, Check, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import Hls from 'hls.js';
import { VideoItem } from '../types/video';
import { Comments } from './Comments';
import { FUNNELS } from '../ads';
import { soundFX } from '../utils/audio';

interface WatchModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isSavedInLasso: boolean;
  onToggleLasso: (video: VideoItem) => void;
  relatedVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onOpenModel?: (name: string) => void;
}

/** HLS playback via hls.js (beeg proxy streams). Falls back to native HLS on Safari. */
const HlsPlayer: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false, maxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(el);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal && hls) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        }
      });
      el.play().catch(() => {});
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src;
      el.play().catch(() => {});
    }
    return () => { hls?.destroy(); };
  }, [src]);
  return <video ref={ref} controls autoPlay playsInline title={title} className="absolute inset-0 w-full h-full" />;
};

const fmtDate = (iso: string) => {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const WatchModal: React.FC<WatchModalProps> = ({
  video,
  onClose,
  isSavedInLasso,
  onToggleLasso,
  relatedVideos,
  onSelectVideo,
  onOpenModel,
}) => {
  const [likesCount, setLikesCount] = useState(video?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relIndex, setRelIndex] = useState(0);

  useEffect(() => {
    setLikesCount(video?.likes || 0);
    setHasLiked(false);
    setCopied(false);
    setRelIndex(0);
  }, [video]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!video) return null;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCheerClick();
    if (!hasLiked) setLikesCount((n) => n + 1);
    else setLikesCount((n) => Math.max(0, n - 1));
    setHasLiked(!hasLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCheerClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#video=${video.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLasso = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCheerClick();
    onToggleLasso(video);
  };

  const related = relatedVideos.filter((v) => v.id !== video.id);
  const relSlice = related.slice(relIndex, relIndex + 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-[1200px] bg-[#0B101C] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
          {/* Player / Embed */}
          <div className="relative bg-black aspect-video w-full">
            {video.embedId ? (
              <iframe
                key={video.id}
                src={`https://www.pornhub.com/embed/${video.embedId}`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                referrerPolicy="no-referrer"
              />
            ) : video.player === 'hls' && video.videoUrl ? (
              <HlsPlayer src={video.videoUrl} title={video.title} />
            ) : (
              <video src={video.videoUrl} controls autoPlay className="absolute inset-0 w-full h-full" />
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white hover:text-[#E07A5F] backdrop-blur-md transition-colors"
              title="Close player (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
            {/* Left: info + photos */}
            <div className="p-4 sm:p-6">
              <h2 className="font-varsity text-lg sm:text-xl font-bold text-white leading-snug">{video.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-mono text-slate-400">
                <button
                  onClick={() => onOpenModel && video.models?.[0] && onOpenModel(video.models[0])}
                  className="flex items-center gap-2 hover:text-[#E07A5F] transition-colors"
                >
                  <img src={video.channel.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-slate-200 font-semibold">{video.channel.name}</span>
                </button>
                <span>{video.viewsFormatted} views</span>
                <span>{fmtDate(video.uploadDate)}</span>
                <span className="px-1.5 py-0.5 bg-[#141B2D] rounded text-[10px] text-[#E07A5F] font-bold">{video.quality}</span>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 mt-4 pb-4 border-b border-[#1E293B]">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    hasLiked ? 'bg-[#E07A5F] text-white' : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} /> {likesCount}
                </button>
                <button
                  onClick={handleLasso}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    isSavedInLasso ? 'bg-[#E07A5F] text-white' : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSavedInLasso ? 'fill-white' : ''}`} />
                  {isSavedInLasso ? 'In Lasso List' : 'Lasso It'}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-[#141B2D] text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* Tags + categories */}
              {(video.tags.length > 0 || video.category) && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {video.category && (
                    <span className="px-2 py-0.5 rounded bg-[#E07A5F]/15 text-[#E07A5F] text-[11px] font-mono font-semibold border border-[#E07A5F]/30">
                      #{video.category.toLowerCase().replace(/[^a-z0-9]+/g, '')}
                    </span>
                  )}
                  {video.tags.slice(0, 8).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-[#141B2D] text-slate-300 text-[11px] font-mono border border-[#1E293B]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Live-cam funnel */}
              <a
                href={FUNNELS.chaturbate}
                target="_blank"
                rel="noopener nofollow sponsored"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ff4655] hover:bg-[#d93a48] text-white text-xs font-bold tracking-wide transition-colors"
              >
                🔴 LIVE NOW — Watch Real Girls Streaming Free
              </a>

              <Comments videoId={video.id} />

              {/* Photo strip */}
              {video.photos && video.photos.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-varsity text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Photos from this reel</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {video.photos.map((p, i) => (
                      <div key={i} className="aspect-video rounded-md overflow-hidden border border-[#1E293B] bg-[#0A0E18]">
                        <img src={p} alt={`${video.title} photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: related rail */}
            <div className="border-t lg:border-t-0 lg:border-l border-[#1E293B] p-4 bg-[#080C14]/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-varsity text-sm font-bold text-slate-200 uppercase tracking-wider">Up Next</h3>
                {related.length > 6 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRelIndex((i) => Math.max(0, i - 6))}
                      disabled={relIndex === 0}
                      className="p-1 rounded bg-[#141B2D] text-slate-300 disabled:opacity-40 hover:text-white"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRelIndex((i) => Math.min(related.length - 6, i + 6))}
                      disabled={relIndex + 6 >= related.length}
                      className="p-1 rounded bg-[#141B2D] text-slate-300 disabled:opacity-40 hover:text-white"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {relSlice.map((rv) => (
                  <div
                    key={rv.id}
                    onClick={() => { soundFX.playWhistleChime(); onSelectVideo(rv); }}
                    className="group flex gap-2.5 cursor-pointer rounded-lg p-1.5 hover:bg-[#101726] transition-colors"
                  >
                    <div className="relative w-32 shrink-0 aspect-video rounded-md overflow-hidden bg-[#0A0E18] border border-[#1E293B]">
                      {rv.thumbUrl ? (
                        <img src={rv.thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-tr ${rv.cardTheme.bgGradient}`} />
                      )}
                      <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-black/85 text-white px-1 rounded">{rv.duration}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-[#E07A5F] line-clamp-2 leading-snug">{rv.title}</h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">{rv.channel.name} &middot; {rv.viewsFormatted}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};