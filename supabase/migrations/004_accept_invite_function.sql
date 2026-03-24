-- ============================================
-- 004: Accept invite RPC function
-- ============================================

CREATE OR REPLACE FUNCTION accept_invite(p_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_invite share_invites%ROWTYPE;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invite FROM share_invites
    WHERE token = p_token AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  -- Don't let the owner accept their own invite
  IF EXISTS (SELECT 1 FROM todo_lists WHERE id = v_invite.list_id AND owner_id = v_user_id) THEN
    RETURN v_invite.list_id;
  END IF;

  INSERT INTO list_shares (list_id, shared_with, role)
    VALUES (v_invite.list_id, v_user_id, v_invite.role)
    ON CONFLICT (list_id, shared_with) DO NOTHING;

  RETURN v_invite.list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
