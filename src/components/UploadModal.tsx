import React, { useState } from 'react';
import { X, UploadCloud, Film, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '../types/video';
import { VIDEO_ROWS } from '../data/siteData';
import { soundFX } from '../utils/audio';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (newVideo: VideoItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
}) => {
  const [title, setTitle] = useState('');
  const [rowId, setRowId] = useState<'primetime' | 'rodeo' | 'halftime' | 'vault' | 'tailgate'>('primetime');
  const [duration, setDuration] = useState('05:30');
  const [creatorName, setCreatorName] = useState('CampusCowgirl_TX');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('Football, Highlights, Tailgate');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundFX.playWhistleChime();

    const selectedRow = VIDEO_ROWS.find((r) => r.id === rowId) || VIDEO_ROWS[0];
    const tagsArray = tagInput.split(',').map((t) => t.trim()).filter(Boolean);

    // Random sample video from available pool
    const samplePool = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    ];
    const videoUrl = samplePool[Math.floor(Math.random() * samplePool.length)];

    const newVideo: VideoItem = {
      id: `uploaded-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Uploaded straight from the stadium sideline via sadcowgirl.fun creator portal.',
      rowId: selectedRow.id,
      rowName: selectedRow.title,
      category: 'Fan Submission',
      duration: duration || '04:20',
      durationSec: 260,
      views: 120,
      viewsFormatted: '120',
      uploadDate: 'Just now',
      likes: 12,
      quality: '4K',
      channel: {
        name: creatorName.trim() || 'SidelineFan',
        handle: `@${(creatorName.trim() || 'fan').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: '🤠',
        verified: true,
        subscribers: '10.5K',
      },
      cardTheme: {
        badge: 'NEW DROP',
        accentColor: '#E07A5F',
        secondaryColor: '#D97706',
        bgGradient: 'from-[#2A1613] via-[#1A1010] to-[#0A0707]',
        stadiumTag: 'SIDELINE FAN UPLOAD · 4K',
        iconType: 'football',
      },
      videoUrl,
      chapters: [
        { time: 0, label: 'Kickoff', timeFormatted: '00:00' },
        { time: 60, label: 'Game Highlights', timeFormatted: '01:00' },
      ],
      tags: tagsArray.length > 0 ? tagsArray : ['Football', 'LoneStar', 'Uploaded'],
      comments: [
        {
          id: `fc_${Date.now()}`,
          user: 'StateReferee',
          avatar: '🦓',
          time: 'Just now',
          text: 'Verified clean play! Welcome to the 5-row tube.',
          likes: 3,
        },
      ],
    };

    onAddVideo(newVideo);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0B0F19] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0E1524]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#E07A5F]" />
            <h3 className="font-varsity text-lg font-bold text-white tracking-wide">
              Publish Reel to sadcowgirl.fun
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-[#141B2D] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="font-varsity text-xl font-bold text-white">Reel Published!</h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Your clip is now live in Row {VIDEO_ROWS.find((r) => r.id === rowId)?.index}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Reel Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 50-Yard Hail Mary with 2 Seconds on the Clock"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Target Row Selection */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Row (5 Themed Categories) *
              </label>
              <select
                value={rowId}
                onChange={(e) => setRowId(e.target.value as any)}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
              >
                {VIDEO_ROWS.map((row) => (
                  <option key={row.id} value={row.id} className="bg-[#0B0F19]">
                    Row {row.index}: {row.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid 2-col: Creator & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Creator / Team
                </label>
                <input
                  type="text"
                  placeholder="e.g. AustinRustlers"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Duration (MM:SS)
                </label>
                <input
                  type="text"
                  placeholder="04:45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Give fans the sideline breakdown of what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Touchdown, Rodeo, Halftime, Tailgate"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-[#141B2D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#E07A5F] hover:bg-[#C25D42] text-white font-bold uppercase tracking-wider text-xs sm:text-sm rounded-lg shadow-lg shadow-[#E07A5F]/20 flex items-center justify-center gap-2 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Broadcast Immediately</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
