-- Expose current_setting via GraphQL safely
CREATE FUNCTION app_public.current_setting(name text)
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT current_setting(name, true)
$$;

-- ============ PERMISSIONS ============

-- REVOKE everything by default
REVOKE ALL ON SCHEMA app_public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA app_public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA app_public FROM PUBLIC;

-- Grant to authenticated role
GRANT USAGE ON SCHEMA app_public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app_public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app_public TO authenticated;