import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Columns } from 'lucide-react';
import { VideoItem, VideoRowConfig } from '../types/video';
import { VideoCard } from './VideoCard';
import { soundFX } from '../utils/audio';

interface VideoRowProps {
  rowConfig: VideoRowConfig;
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  lassoIds: Set<string>;
  onToggleLasso: (video: VideoItem) => void;
}

export const VideoRow: React.FC<VideoRowProps> = ({
  rowConfig,
  videos,
  onSelectVideo,
  lassoIds,
  onToggleLasso,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isGridView, setIsGridView] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [videos, isGridView]);

  const handleScroll = (direction: 'left' | 'right') => {
    soundFX.playCheerClick();
    if (scrollContainerRef.current) {
      const offset = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -offset : offset,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section
      id={`row-${rowConfig.id}`}
      className="scroll-mt-20 py-8 border-b border-[#1E293B]/60 last:border-b-0"
    >
      {/* Row Header with Natural Editorial Numbering */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-[#E07A5F] tracking-widest uppercase">
              ROW {rowConfig.index}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
              {rowConfig.badge}
            </span>
          </div>
          <h2 className="font-varsity text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            {rowConfig.title}
          </h2>
          <p className="font-body text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {rowConfig.subtitle}
          </p>
        </div>

        {/* Row View Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Toggle Carousel vs Grid */}
          <div className="flex items-center bg-[#111827] border border-[#1E293B] rounded-lg p-0.5">
            <button
              onClick={() => setIsGridView(false)}
              title="Carousel Mode"
              className={`p-1.5 rounded transition-colors ${
                !isGridView ? 'bg-[#1E293B] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridView(true)}
              title="5-Column Grid Mode"
              className={`p-1.5 rounded transition-colors ${
                isGridView ? 'bg-[#1E293B] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Left / Right Arrows */}
          {!isGridView && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={!canScrollLeft}
                onClick={() => handleScroll('left')}
                title="Previous videos"
                className={`p-2 rounded-lg border border-[#1E293B] transition-all ${
                  canScrollLeft
                    ? 'bg-[#111827] text-white hover:bg-[#1A2338] hover:border-[#E07A5F]/50 active:scale-95'
                    : 'bg-[#0E1524]/40 text-slate-600 cursor-not-allowed border-transparent'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!canScrollRight}
                onClick={() => handleScroll('right')}
                title="Next videos"
                className={`p-2 rounded-lg border border-[#1E293B] transition-all ${
                  canScrollRight
                    ? 'bg-[#111827] text-white hover:bg-[#1A2338] hover:border-[#E07A5F]/50 active:scale-95'
                    : 'bg-[#0E1524]/40 text-slate-600 cursor-not-allowed border-transparent'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Videos Layout: Carousel vs 5-Column Grid */}
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
              isSavedInLasso={lassoIds.has(video.id)}
              onToggleLasso={onToggleLasso}
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="w-[280px] sm:w-[320px] md:w-[340px] xl:w-[300px] shrink-0 flex"
            >
              <div className="w-full">
                <VideoCard
                  video={video}
                  onSelect={onSelectVideo}
                  isSavedInLasso={lassoIds.has(video.id)}
                  onToggleLasso={onToggleLasso}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
