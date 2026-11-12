CREATE TABLE control_state (
  id INTEGER PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  draft_json TEXT NOT NULL,
  live_json TEXT NOT NULL,
  last_operation TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL,
  published_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE control_versions (
  id TEXT PRIMARY KEY NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE control_audit (
  id TEXT PRIMARY KEY NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE shift_notes (
  id TEXT PRIMARY KEY NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE activity_daily (
  day TEXT NOT NULL,
  room_id TEXT NOT NULL,
  arrivals INTEGER NOT NULL DEFAULT 0,
  discoveries INTEGER NOT NULL DEFAULT 0,
  revisits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, room_id)
);
