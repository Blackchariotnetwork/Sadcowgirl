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