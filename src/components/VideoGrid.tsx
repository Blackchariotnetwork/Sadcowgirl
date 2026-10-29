import React from 'react';
import { VideoItem } from '../types/video';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: VideoItem[];
  lassoIds: Set<string>;
  onSelectVideo: (v: VideoItem) => void;
  onToggleLasso: (v: VideoItem) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, lassoIds, onSelectVideo, onToggleLasso }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
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
);