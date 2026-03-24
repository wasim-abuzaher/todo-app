-- ============================================
-- 003: Enable Supabase Realtime
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'todos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE todos;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'subtasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'todo_tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE todo_tags;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'list_shares'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE list_shares;
  END IF;
END $$;
