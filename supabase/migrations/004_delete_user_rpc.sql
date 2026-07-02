-- v0.5: RPC function for account self-deletion.
-- Deletes the calling user from auth.users; all downstream tables
-- (profiles, game_logs, game_media, user_favorite_teams) cascade automatically.

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
