-- Two tenants, each with one schema, and an RLS policy on metaschema_public.function
-- that only lets a caller write and read its own database's rows (jwt.claims.database_id).
INSERT INTO metaschema_public.database (id, name) VALUES
  ('00000000-0000-4000-8000-00000000000a', 'tenant_a'),
  ('00000000-0000-4000-8000-00000000000b', 'tenant_b');

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name) VALUES
  ('00000000-0000-4000-8000-0000000000aa', '00000000-0000-4000-8000-00000000000a', 'app_public', 'tenant_a_app_public'),
  ('00000000-0000-4000-8000-0000000000bb', '00000000-0000-4000-8000-00000000000b', 'app_public', 'tenant_b_app_public');

GRANT USAGE ON SCHEMA metaschema_public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON metaschema_public.function TO authenticated;

ALTER TABLE metaschema_public.function ENABLE ROW LEVEL SECURITY;

CREATE POLICY function_own_database ON metaschema_public.function
  TO authenticated
  USING (database_id = current_setting('jwt.claims.database_id')::uuid)
  WITH CHECK (database_id = current_setting('jwt.claims.database_id')::uuid);
