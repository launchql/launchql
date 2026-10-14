-- Error-events fixture: a stand-in auth module, a mutation that is refused with
-- a structured registry code (PRINCIPAL_CHILD_WIDENS, in the errors.raise_error
-- shape: MESSAGE = code, DETAIL = {code, context, class}), and a stand-in
-- events module with the tenant `record_event`/`record_error` the server
-- resolves through metaschema_modules_public.events_module.
--
-- Compose after app-schemas/simple-pets/schema.sql and scoped/test-data.sql.

-- ─── Auth (rls module stand-in) ──────────────────────────────────────────────

CREATE SCHEMA "simple-pets-auth-private";
GRANT USAGE ON SCHEMA "simple-pets-auth-private" TO administrator, authenticated, anonymous;

-- Two fixed credentials: a human session and a principal session owned by the
-- same human (jwt.claims.user_id stays the human; principal_id is the agent).
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
    'aaaaaaaa-0000-4000-8000-000000000001'::uuid,
    'bbbbbbbb-0000-4000-8000-000000000001'::uuid,
    NULL::uuid,
    'full'::text,
    'session'::text,
    CASE token_str
      WHEN 'principal-token' THEN 'cccccccc-0000-4000-8000-000000000001'::uuid
      ELSE NULL::uuid
    END,
    NULL::uuid,
    NULL::uuid,
    NULL::text
  WHERE token_str IN ('human-token', 'principal-token');
$$ LANGUAGE sql STABLE;

-- ─── Mutation that refuses widening ──────────────────────────────────────────

CREATE FUNCTION "simple-pets-public".create_child_principal(capabilities text[])
RETURNS boolean AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = 'P0001',
    MESSAGE = 'PRINCIPAL_CHILD_WIDENS',
    DETAIL = jsonb_build_object(
      'code', 'PRINCIPAL_CHILD_WIDENS',
      'context', jsonb_build_object('capabilities', to_jsonb(capabilities)),
      'class', 'public'
    )::text;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ─── Events (events module stand-in) ─────────────────────────────────────────

CREATE SCHEMA "simple-pets-events-public";
CREATE SCHEMA "simple-pets-events-private";
GRANT USAGE ON SCHEMA "simple-pets-events-public" TO administrator, authenticated;
GRANT USAGE ON SCHEMA "simple-pets-events-private" TO administrator, authenticated;

CREATE TABLE "simple-pets-events-public".app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  actor_id uuid NOT NULL,
  count int NOT NULL DEFAULT 1,
  payload jsonb,
  request_id text DEFAULT current_setting('request.id', true),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON "simple-pets-events-public".app_events TO administrator, authenticated;

-- Event classification: an unregistered name defaults to feeds_levels = true,
-- so `record_error` registers every code it records as an error that earns no
-- ladder progress.
CREATE TABLE "simple-pets-events-public".event_types (
  name text PRIMARY KEY,
  category text NOT NULL,
  feeds_levels boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT ON "simple-pets-events-public".event_types TO administrator, authenticated;

CREATE FUNCTION "simple-pets-events-private".record_event(
  step text,
  actor_id uuid DEFAULT NULL,
  payload jsonb DEFAULT NULL
) RETURNS void AS $$
  INSERT INTO "simple-pets-events-public".app_events (name, actor_id, count, payload)
  VALUES (step, actor_id, 1, payload);
$$ LANGUAGE sql VOLATILE;
GRANT EXECUTE ON FUNCTION "simple-pets-events-private".record_event(text, uuid, jsonb) TO administrator, authenticated;

CREATE FUNCTION "simple-pets-events-private".record_error(
  code text,
  actor_id uuid DEFAULT NULL,
  payload jsonb DEFAULT NULL
) RETURNS void AS $$
  WITH registered AS (
    INSERT INTO "simple-pets-events-public".event_types (name, category, feeds_levels)
    VALUES (code, 'error', false)
    ON CONFLICT (name) DO NOTHING
  )
  INSERT INTO "simple-pets-events-public".app_events (name, actor_id, count, payload)
  VALUES (code, actor_id, 1, payload);
$$ LANGUAGE sql VOLATILE;
GRANT EXECUTE ON FUNCTION "simple-pets-events-private".record_error(text, uuid, jsonb) TO administrator, authenticated;

-- ─── Metaschema registration ─────────────────────────────────────────────────

SET session_replication_role TO replica;

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, is_public)
VALUES
  ('6dba0001-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'auth_private', 'simple-pets-auth-private', false),
  ('6dba0001-0000-4000-8000-000000000002', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'events_public', 'simple-pets-events-public', true),
  ('6dba0001-0000-4000-8000-000000000003', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'events_private', 'simple-pets-events-private', false)
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
