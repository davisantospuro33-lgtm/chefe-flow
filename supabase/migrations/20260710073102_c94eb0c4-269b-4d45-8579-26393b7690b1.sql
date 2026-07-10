
ALTER TABLE public.chefe_state
  ADD COLUMN IF NOT EXISTS daily_instruction text DEFAULT '',
  ADD COLUMN IF NOT EXISTS daily_instruction_polite text DEFAULT '';

CREATE OR REPLACE FUNCTION public.chefe_admin_exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE 'SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    EXECUTE query;
    RETURN jsonb_build_object('ok', true, 'msg', 'executed');
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.chefe_admin_exec_sql(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chefe_admin_exec_sql(text) TO service_role;
