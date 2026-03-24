-- ============================================
-- 002: Row-Level Security policies
-- ============================================

-- Helper: does user have any access to a list?
CREATE OR REPLACE FUNCTION has_list_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM todo_lists WHERE id = p_list_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM list_shares WHERE list_id = p_list_id AND shared_with = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: does user have editor (or owner) access?
CREATE OR REPLACE FUNCTION has_editor_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM todo_lists WHERE id = p_list_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM list_shares WHERE list_id = p_list_id AND shared_with = p_user_id AND role = 'editor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================
-- todo_lists
-- =====================
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_or_shared" ON todo_lists FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM list_shares WHERE list_id = id AND shared_with = auth.uid())
);
CREATE POLICY "insert_own" ON todo_lists FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "update_own" ON todo_lists FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "delete_own" ON todo_lists FOR DELETE USING (owner_id = auth.uid());

-- =====================
-- todos
-- =====================
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_accessible" ON todos FOR SELECT USING (
  has_list_access(list_id, auth.uid())
);
CREATE POLICY "insert_editor" ON todos FOR INSERT WITH CHECK (
  has_editor_access(list_id, auth.uid())
);
CREATE POLICY "update_editor" ON todos FOR UPDATE USING (
  has_editor_access(list_id, auth.uid())
);
CREATE POLICY "delete_editor" ON todos FOR DELETE USING (
  has_editor_access(list_id, auth.uid())
);

-- =====================
-- subtasks
-- =====================
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_accessible" ON subtasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_list_access(todos.list_id, auth.uid()))
);
CREATE POLICY "insert_editor" ON subtasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);
CREATE POLICY "update_editor" ON subtasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);
CREATE POLICY "delete_editor" ON subtasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

-- =====================
-- tags
-- =====================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_tags" ON tags FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- =====================
-- todo_tags
-- =====================
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_accessible" ON todo_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_list_access(todos.list_id, auth.uid()))
);
CREATE POLICY "insert_editor" ON todo_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);
CREATE POLICY "delete_editor" ON todo_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

-- =====================
-- list_shares
-- =====================
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_shares" ON list_shares FOR SELECT USING (
  shared_with = auth.uid() OR
  EXISTS (SELECT 1 FROM todo_lists WHERE id = list_shares.list_id AND owner_id = auth.uid())
);
CREATE POLICY "manage_as_owner" ON list_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todo_lists WHERE id = list_shares.list_id AND owner_id = auth.uid())
);
CREATE POLICY "update_as_owner" ON list_shares FOR UPDATE USING (
  EXISTS (SELECT 1 FROM todo_lists WHERE id = list_shares.list_id AND owner_id = auth.uid())
);
CREATE POLICY "delete_as_owner_or_self" ON list_shares FOR DELETE USING (
  shared_with = auth.uid() OR
  EXISTS (SELECT 1 FROM todo_lists WHERE id = list_shares.list_id AND owner_id = auth.uid())
);

-- =====================
-- share_invites
-- =====================
ALTER TABLE share_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_invites" ON share_invites FOR SELECT USING (
  EXISTS (SELECT 1 FROM todo_lists WHERE id = share_invites.list_id AND owner_id = auth.uid())
);
CREATE POLICY "create_as_owner" ON share_invites FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todo_lists WHERE id = share_invites.list_id AND owner_id = auth.uid())
);
CREATE POLICY "delete_as_owner" ON share_invites FOR DELETE USING (
  EXISTS (SELECT 1 FROM todo_lists WHERE id = share_invites.list_id AND owner_id = auth.uid())
);
