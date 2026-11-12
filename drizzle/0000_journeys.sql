CREATE TABLE journeys (
  user_key TEXT PRIMARY KEY NOT NULL,
  current_room TEXT NOT NULL,
  visited TEXT NOT NULL,
  next_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
