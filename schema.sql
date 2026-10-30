CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  path TEXT NOT NULL DEFAULT '/',
  video_id TEXT,
  kind TEXT NOT NULL DEFAULT 'view',
  referrer TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_visits_ts ON visits (ts);
CREATE INDEX IF NOT EXISTS idx_visits_video ON visits (video_id);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits (path);
CREATE INDEX IF NOT EXISTS idx_visits_kind ON visits (kind);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  video_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Anonymous Rancher',
  text TEXT NOT NULL,
  ip_hash TEXT NOT NULL DEFAULT '',
  likes INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments (video_id);

CREATE TABLE IF NOT EXISTS excluded_visitors (
  visitor TEXT PRIMARY KEY,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);