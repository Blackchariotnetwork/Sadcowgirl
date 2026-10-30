// Site data layer: loads the generated JSON datasets and maps them
// into the theme's VideoItem shape.
import { VideoItem, VideoRowConfig } from '../types/video';

export interface CategoryInfo {
  name: string;
  slug: string;
  videoCount: number;
  totalViews: number;
}

export interface ModelInfo {
  name: string;
  slug: string;
  videoIds: string[];
  totalViews: number;
  photo?: string;
}

export interface SiteData {
  videos: VideoItem[];
  categories: CategoryInfo[];
  models: ModelInfo[];
  generatedAt: string;
}

interface RawVideo {
  id: string;
  slug: string;
  title: string;
  rowId?: string;
  thumbUrl?: string;
  photos?: string[];
  cowgirl?: boolean;
  player?: string;
  embed: string;
  duration: number;
  views: number;
  likes: number;
  upload: string;
  categories: string[];
  tags: string[];
  models: string[];
}

interface RawModel {
  name: string;
  slug: string;
  videoIds: string[];
  totalViews: number;
  photo?: string;
}

// --- Theme generators (deterministic per video id) -------------------------

const GRADIENTS = [
  'from-[#3B2A50] via-[#1B2340] to-[#0E1526]',
  'from-[#502A2A] via-[#2A1B23] to-[#150E14]',
  'from-[#2A3B50] via-[#1B2A40] to-[#0E1424]',
  'from-[#2F4A3A] via-[#1B2E26] to-[#0D1512]',
  'from-[#4A3B22] via-[#2E2416] to-[#161009]',
  'from-[#3A2E50] via-[#251D3A] to-[#120E1E]',
  'from-[#503A2E] via-[#3A281E] to-[#1C130D]',
];
const ACCENTS = ['#E07A5F', '#5FA8E0', '#7BC47F', '#E0B95F', '#B45FE0', '#E05F8E'];
const ICONS = ['football', 'hat', 'bull', 'brass', 'bonfire', 'trophy', 'spurs', 'laces'] as const;
const STADIUM_TAGS = [
  '50-YD STADIUM LIGHTS', 'RODEO BOWL', 'HALFTIME SHOW', 'THE RANCH VAULT',
  'TAILGATE LOT C', 'STATE TITLE GAME', 'SADDLE UP ARENA', 'BRISKET BRACKET',
  'HOMEcoming COURT', 'TRIPLE OPTION', 'BRONC RIDING', 'MAROON & SILVER',
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    : `${m}:${String(r).padStart(2, '0')}`;
}

function avatarFor(name: string): string {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const hue = hashStr(name) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="hsl(${hue},45%,28%)"/><text x="40" y="52" font-family="sans-serif" font-size="34" font-weight="bold" fill="#F3F4F6" text-anchor="middle">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function mapVideo(raw: RawVideo, rows: VideoRowConfig[]): VideoItem {
  const h = hashStr(raw.id);
  const rowId = raw.rowId || rows[0].id;
  const row = rows.find((r) => r.id === rowId) || rows[0];
  // Beeg items often lack performer data — fall back to the studio/channel tag.
  const modelName = raw.models[0] || raw.tags[0] || 'Anonymous Rancher';
  return {
    id: raw.id,
    title: raw.title,
    description: `${raw.title}${raw.models.length ? ` — Starring ${raw.models.join(', ')}.` : ''} Brought to you from the sadcowgirl corral.`,
    rowId,
    rowName: row.title,
    category: raw.categories[0] || 'Uncategorized',
    thumbUrl: raw.thumbUrl || undefined,
    photos: raw.photos || [],
    models: raw.models,
    embedId: raw.player === 'hls' ? undefined : raw.id,
    cowgirl: raw.cowgirl,
    player: raw.player,
    videoUrl: raw.player === 'hls'
      ? `https://sadcowgirl-beeg-proxy.blackchariot-net.workers.dev/stream/beeg/${raw.id.replace('beeg-', '')}`
      : raw.embed,
    duration: formatDuration(raw.duration),
    durationSec: raw.duration,
    views: raw.views,
    viewsFormatted: formatViews(raw.views),
    uploadDate: raw.upload,
    likes: raw.likes,
    quality: 'HD',
    channel: {
      name: modelName,
      handle: `@${modelName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
      avatar: avatarFor(modelName),
      verified: false,
      subscribers: formatViews(Math.max(1200, Math.round(raw.views / 6))),
    },
    cardTheme: {
      badge: row.badge,
      accentColor: ACCENTS[h % ACCENTS.length],
      secondaryColor: ACCENTS[(h >> 3) % ACCENTS.length],
      bgGradient: GRADIENTS[h % GRADIENTS.length],
      stadiumTag: STADIUM_TAGS[h % STADIUM_TAGS.length],
      iconType: ICONS[h % ICONS.length],
    },
    chapters: [],
    tags: raw.tags,
    comments: [],
  };
}

export async function loadSiteData(): Promise<SiteData> {
  const [vRes, cRes, mRes] = await Promise.all([
    fetch('/data/videos.json'),
    fetch('/data/categories.json'),
    fetch('/data/models.json'),
  ]);
  if (!vRes.ok || !cRes.ok || !mRes.ok) throw new Error('Failed to load site data');
  const rawVideos: (RawVideo & { rowId?: string })[] = await vRes.json();
  const categories: CategoryInfo[] = await cRes.json();
  const rawModels: RawModel[] = await mRes.json();

  const rows = VIDEO_ROWS;
  const videos = rawVideos.map((r) => mapVideo(r, rows));

  // Bucket videos into the 5 home rows.
  const byViews = [...videos].sort((a, b) => b.views - a.views);
  const byLikes = [...videos].sort((a, b) => b.likes / (b.views || 1) - a.likes / (a.views || 1));
  const byNewest = [...videos].sort((a, b) => (b.uploadDate || '').localeCompare(a.uploadDate || ''));
  const byOldest = [...videos].sort((a, b) => (a.uploadDate || '9').localeCompare(b.uploadDate || '9'));

  const assign = (list: VideoItem[], rowId: string) => {
    for (const v of list) if (!v.rowId || v.rowId === rows[0].id) v.rowId = rowId;
  };
  // Clear default, then assign buckets (no overlaps).
  for (const v of videos) v.rowId = '';
  const take = (pool: VideoItem[], n: number, pred?: (v: VideoItem) => boolean) => {
    const out: VideoItem[] = [];
    for (const v of pool) {
      if (out.length >= n) break;
      if (!v.rowId && (!pred || pred(v))) out.push(v);
    }
    return out;
  };
  const primetime = take(byViews, 24);
  primetime.forEach((v) => (v.rowId = 'primetime'));
  const halftime = take(byNewest, 24);
  halftime.forEach((v) => (v.rowId = 'halftime'));
  const vault = take(byOldest.filter((v) => v.uploadDate && v.uploadDate < '2016-01-01'), 24);
  vault.forEach((v) => (v.rowId = 'vault'));
  const rodeo = take(byLikes, 24);
  rodeo.forEach((v) => (v.rowId = 'rodeo'));
  const tailgate = take([...videos].sort(() => Math.random() - 0.5), 24);
  tailgate.forEach((v) => (v.rowId = 'tailgate'));

  const models: ModelInfo[] = rawModels;
  return { videos, categories, models, generatedAt: '' };
}

// The 5 themed home rows (kept from the original theme).
export const VIDEO_ROWS: VideoRowConfig[] = [
  { id: 'primetime', index: '01', title: 'Primetime Showdowns', subtitle: 'The most-watched clips under the stadium floodlights', badge: 'COLLEGE GAMEDAY' },
  { id: 'rodeo', index: '02', title: 'Viral Rodeo', subtitle: 'Highest crowd-approval ratio in the corral', badge: 'CROWD FAVORITE' },
  { id: 'halftime', index: '03', title: 'Halftime Fresh', subtitle: 'Newest uploads hot off the trail ride', badge: 'JUST LANDED' },
  { id: 'vault', index: '04', title: 'Ranch Vault', subtitle: 'Classic footage from the deep archive', badge: 'VINTAGE REEL' },
  { id: 'tailgate', index: '05', title: 'Tailgate Mix', subtitle: 'A shuffled cooler of surprises', badge: 'WILD CARD' },
];