-- ============================================
-- 001: Create all tables
-- ============================================

-- Todo lists
CREATE TABLE IF NOT EXISTS todo_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todo_lists_owner ON todo_lists(owner_id);

-- Todos
CREATE TABLE IF NOT EXISTS todos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id      UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date     DATE,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full-text search column (only add if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'fts'
  ) THEN
    ALTER TABLE todos ADD COLUMN fts tsvector
      GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_todos_list ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_by ON todos(created_by);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_fts ON todos USING GIN(fts);

-- Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id    UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_todo ON subtasks(todo_id);

-- Tags (scoped per user)
CREATE TABLE IF NOT EXISTS tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_owner ON tags(owner_id);

-- Todo-tag join table
CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_todo_tags_tag ON todo_tags(tag_id);

-- List sharing
CREATE TABLE IF NOT EXISTS list_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, shared_with)
);

CREATE INDEX IF NOT EXISTS idx_list_shares_user ON list_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_list_shares_list ON list_shares(list_id);

-- Share invites (link-based)
CREATE TABLE IF NOT EXISTS share_invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_invites_token ON share_invites(token);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON todo_lists;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON todo_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON todos;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
