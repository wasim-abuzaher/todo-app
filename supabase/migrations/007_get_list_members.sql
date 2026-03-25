-- Returns all members of a list: owner + collaborators, each with email and role.
CREATE OR REPLACE FUNCTION get_list_members(p_list_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role TEXT
) AS $$
BEGIN
  IF NOT has_list_access(p_list_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Owner first
  RETURN QUERY
  SELECT tl.owner_id, u.email::TEXT, 'owner'::TEXT
  FROM todo_lists tl
  JOIN auth.users u ON u.id = tl.owner_id
  WHERE tl.id = p_list_id;

  -- Then collaborators
  RETURN QUERY
  SELECT ls.shared_with, u.email::TEXT, ls.role::TEXT
  FROM list_shares ls
  JOIN auth.users u ON u.id = ls.shared_with
  WHERE ls.list_id = p_list_id
  ORDER BY ls.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
