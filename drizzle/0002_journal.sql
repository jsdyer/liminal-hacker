CREATE TABLE journal_posts (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  draft_json TEXT NOT NULL,
  published_json TEXT,
  revision INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER,
  archived_at INTEGER
);
--> statement-breakpoint
CREATE INDEX journal_posts_published ON journal_posts(published_at, archived_at);
--> statement-breakpoint
CREATE TABLE journal_photos (
  id TEXT PRIMARY KEY NOT NULL,
  object_key TEXT NOT NULL,
  title TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0
);
