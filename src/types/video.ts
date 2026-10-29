export interface VideoComment {
  id: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

export interface VideoChapter {
  time: number; // in seconds
  label: string;
  timeFormatted: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  rowId: string;
  rowName: string;
  category: string;
  thumbUrl?: string;
  photos?: string[];
  models?: string[];
  embedId?: string;
  cowgirl?: boolean;
  duration: string;
  durationSec: number;
  views: number;
  viewsFormatted: string;
  uploadDate: string;
  likes: number;
  quality: '4K' | '1080p' | '60FPS' | 'HD';
  featured?: boolean;
  channel: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    subscribers: string;
  };
  cardTheme: {
    badge: string;
    accentColor: string;
    secondaryColor: string;
    bgGradient: string;
    stadiumTag: string; // e.g. "50-YD STADIUM LIGHTS", "RODEO BOWL"
    iconType: 'football' | 'hat' | 'bull' | 'brass' | 'bonfire' | 'trophy' | 'spurs' | 'laces';
  };
  videoUrl: string;
  chapters: VideoChapter[];
  tags: string[];
  comments: VideoComment[];
}

export interface VideoRowConfig {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  badge: string;
}
