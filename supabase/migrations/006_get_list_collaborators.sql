-- Returns list_shares enriched with the collaborator's email from auth.users.
-- SECURITY DEFINER so the function can read auth.users on behalf of the caller.
CREATE OR REPLACE FUNCTION get_list_collaborators(p_list_id UUID)
RETURNS TABLE (
  id UUID,
  list_id UUID,
  shared_with UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  email TEXT
) AS $$
BEGIN
  IF NOT has_list_access(p_list_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT ls.id, ls.list_id, ls.shared_with, ls.role::TEXT, ls.created_at,
         u.email::TEXT
  FROM list_shares ls
  JOIN auth.users u ON u.id = ls.shared_with
  WHERE ls.list_id = p_list_id
  ORDER BY ls.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
