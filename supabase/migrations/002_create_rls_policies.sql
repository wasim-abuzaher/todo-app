-- ============================================
-- 002: Row-Level Security policies
-- ============================================

-- Helper: check if user has a share on a list (bypasses RLS on list_shares)
CREATE OR REPLACE FUNCTION is_shared_with_user(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM list_shares WHERE list_id = p_list_id AND shared_with = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user owns a list (bypasses RLS on todo_lists)
CREATE OR REPLACE FUNCTION is_list_owner(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM todo_lists WHERE id = p_list_id AND owner_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: does user have any access to a list?
CREATE OR REPLACE FUNCTION has_list_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_list_owner(p_list_id, p_user_id) OR is_shared_with_user(p_list_id, p_user_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: does user have editor (or owner) access?
CREATE OR REPLACE FUNCTION has_editor_access(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_list_owner(p_list_id, p_user_id) OR EXISTS (
    SELECT 1 FROM list_shares WHERE list_id = p_list_id AND shared_with = p_user_id AND role = 'editor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================
-- todo_lists
-- =====================
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_shared" ON todo_lists;
CREATE POLICY "select_own_or_shared" ON todo_lists FOR SELECT USING (
  owner_id = auth.uid() OR
  is_shared_with_user(id, auth.uid())
);

DROP POLICY IF EXISTS "insert_own" ON todo_lists;
CREATE POLICY "insert_own" ON todo_lists FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "update_own" ON todo_lists;
CREATE POLICY "update_own" ON todo_lists FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "delete_own" ON todo_lists;
CREATE POLICY "delete_own" ON todo_lists FOR DELETE USING (owner_id = auth.uid());

-- =====================
-- todos
-- =====================
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_accessible" ON todos;
CREATE POLICY "select_accessible" ON todos FOR SELECT USING (
  has_list_access(list_id, auth.uid())
);

DROP POLICY IF EXISTS "insert_editor" ON todos;
CREATE POLICY "insert_editor" ON todos FOR INSERT WITH CHECK (
  has_editor_access(list_id, auth.uid())
);

DROP POLICY IF EXISTS "update_editor" ON todos;
CREATE POLICY "update_editor" ON todos FOR UPDATE USING (
  has_editor_access(list_id, auth.uid())
);

DROP POLICY IF EXISTS "delete_editor" ON todos;
CREATE POLICY "delete_editor" ON todos FOR DELETE USING (
  has_editor_access(list_id, auth.uid())
);

-- =====================
-- subtasks
-- =====================
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_accessible" ON subtasks;
CREATE POLICY "select_accessible" ON subtasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_list_access(todos.list_id, auth.uid()))
);

DROP POLICY IF EXISTS "insert_editor" ON subtasks;
CREATE POLICY "insert_editor" ON subtasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

DROP POLICY IF EXISTS "update_editor" ON subtasks;
CREATE POLICY "update_editor" ON subtasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

DROP POLICY IF EXISTS "delete_editor" ON subtasks;
CREATE POLICY "delete_editor" ON subtasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = subtasks.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

-- =====================
-- tags
-- =====================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_tags" ON tags;
CREATE POLICY "own_tags" ON tags FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- =====================
-- todo_tags
-- =====================
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_accessible" ON todo_tags;
CREATE POLICY "select_accessible" ON todo_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_list_access(todos.list_id, auth.uid()))
);

DROP POLICY IF EXISTS "insert_editor" ON todo_tags;
CREATE POLICY "insert_editor" ON todo_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

DROP POLICY IF EXISTS "delete_editor" ON todo_tags;
CREATE POLICY "delete_editor" ON todo_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND has_editor_access(todos.list_id, auth.uid()))
);

-- =====================
-- list_shares
-- =====================
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_shares" ON list_shares;
CREATE POLICY "select_own_shares" ON list_shares FOR SELECT USING (
  shared_with = auth.uid() OR
  is_list_owner(list_id, auth.uid())
);

DROP POLICY IF EXISTS "manage_as_owner" ON list_shares;
CREATE POLICY "manage_as_owner" ON list_shares FOR INSERT WITH CHECK (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY IF EXISTS "update_as_owner" ON list_shares;
CREATE POLICY "update_as_owner" ON list_shares FOR UPDATE USING (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY IF EXISTS "delete_as_owner_or_self" ON list_shares;
CREATE POLICY "delete_as_owner_or_self" ON list_shares FOR DELETE USING (
  shared_with = auth.uid() OR
  is_list_owner(list_id, auth.uid())
);

-- =====================
-- share_invites
-- =====================
ALTER TABLE share_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_invites" ON share_invites;
CREATE POLICY "select_own_invites" ON share_invites FOR SELECT USING (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY IF EXISTS "create_as_owner" ON share_invites;
CREATE POLICY "create_as_owner" ON share_invites FOR INSERT WITH CHECK (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY IF EXISTS "delete_as_owner" ON share_invites;
CREATE POLICY "delete_as_owner" ON share_invites FOR DELETE USING (
  is_list_owner(list_id, auth.uid())
);
