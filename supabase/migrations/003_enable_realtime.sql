-- ============================================
-- 003: Enable Supabase Realtime
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE todos;
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE todo_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE list_shares;
