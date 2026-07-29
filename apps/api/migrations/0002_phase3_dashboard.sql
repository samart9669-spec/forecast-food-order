CREATE TABLE IF NOT EXISTS signal_cache (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  signal_name TEXT NOT NULL,
  sample_rate REAL NOT NULL,
  start_seconds REAL NOT NULL DEFAULT 0,
  end_seconds REAL NOT NULL,
  r2_key TEXT NOT NULL,
  source_upload_id TEXT NOT NULL,
  source_etag TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(session_id, signal_name, start_seconds, end_seconds)
);
CREATE INDEX IF NOT EXISTS idx_signal_cache_session_signal ON signal_cache(session_id, signal_name);

CREATE TABLE IF NOT EXISTS statistics (
  session_id TEXT PRIMARY KEY,
  ahi REAL NOT NULL,
  ca INTEGER NOT NULL,
  oa INTEGER NOT NULL,
  h INTEGER NOT NULL,
  rera INTEGER NOT NULL,
  leak_median REAL,
  leak_95 REAL,
  pressure_median REAL,
  pressure_95 REAL,
  usage_hours REAL NOT NULL,
  minute_ventilation_average REAL,
  respiratory_rate_average REAL,
  snore_index REAL NOT NULL,
  flow_limitation_index REAL NOT NULL,
  mask_on_off INTEGER NOT NULL,
  source_fingerprint TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('OA','CA','H','RERA','FL','CSR','LL')),
  start_seconds REAL NOT NULL,
  duration_seconds REAL NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_events_session_start ON events(session_id, start_seconds);
CREATE INDEX IF NOT EXISTS idx_events_session_type ON events(session_id, type);

CREATE TABLE IF NOT EXISTS night_summary (
  session_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_seconds REAL NOT NULL,
  device TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_night_summary_started_at ON night_summary(started_at DESC);
