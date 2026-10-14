-- Auth-cookie fixture: a stand-in auth module whose `authenticate` accepts the
-- one token `sign_in`/`sign_up` hand out, plus `sign_out`, so the server's
-- session-cookie lifecycle (AuthCookiePlugin) and CSRF gate run end to end.
--
-- Compose after app-schemas/simple-pets/schema.sql and scoped/test-data.sql.

CREATE SCHEMA "simple-pets-auth-private";
GRANT USAGE ON SCHEMA "simple-pets-auth-private" TO administrator, authenticated, anonymous;

CREATE FUNCTION "simple-pets-auth-private".authenticate(token_str text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  session_id uuid,
  access_level text,
  kind text,
  principal_id uuid,
  root_session_id uuid,
  parent_session_id uuid,
  intent text
) AS $$
  SELECT
    'aaaaaaaa-0000-4000-8000-000000000002'::uuid,
    'bbbbbbbb-0000-4000-8000-000000000002'::uuid,
    NULL::uuid,
    'full'::text,
    'session'::text,
    NULL::uuid,
    NULL::uuid,
    NULL::uuid,
    NULL::text
  WHERE token_str = 'session-token';
$$ LANGUAGE sql STABLE;

-- As the generated auth module does: the server resolves the token as the anonymous request role.
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".authenticate(text) TO anonymous, authenticated;

CREATE TYPE "simple-pets-public".auth_token AS (
  access_token text
);

CREATE FUNCTION "simple-pets-public".sign_in(email text, password text)
RETURNS "simple-pets-public".auth_token AS $$
  SELECT ROW('session-token')::"simple-pets-public".auth_token;
$$ LANGUAGE sql VOLATILE;

CREATE FUNCTION "simple-pets-public".sign_up(email text, password text)
RETURNS "simple-pets-public".auth_token AS $$
  SELECT ROW('session-token')::"simple-pets-public".auth_token;
$$ LANGUAGE sql VOLATILE;

CREATE FUNCTION "simple-pets-public".sign_out()
RETURNS boolean AS $$
  SELECT true;
$$ LANGUAGE sql VOLATILE;

-- ─── Metaschema registration ─────────────────────────────────────────────────

SET session_replication_role TO replica;

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, is_public)
VALUES
  ('6dba0001-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'auth_private', 'simple-pets-auth-private', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO metaschema_public.function (id, database_id, schema_id, name)
VALUES
  ('6dba0002-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba0001-0000-4000-8000-000000000001', 'authenticate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO routing_public.rls_settings
  (id, database_id, authenticate_schema_id, authenticate_function_id, authenticate_strict_function_id)
VALUES
  ('6dba0003-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
   '6dba0001-0000-4000-8000-000000000001', '6dba0002-0000-4000-8000-000000000001', '6dba0002-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;
