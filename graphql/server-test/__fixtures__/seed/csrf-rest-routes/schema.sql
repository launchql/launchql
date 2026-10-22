-- CSRF on the REST routes: records which user each function invocation ran as,
-- so a test can tell a cookie-authenticated invocation from an anonymous one.
--
-- Compose after compute/setup.sql and auth-cookie/schema.sql.

ALTER TABLE compute_public.function_invocations
  ADD COLUMN actor_id uuid DEFAULT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;

-- A minimal agent-chat module so POST /v1/threads can create a thread; the
-- thread's owner_id is the user the request authenticated as.
CREATE TABLE IF NOT EXISTS metaschema_modules_public.agent_chat_module (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  database_id uuid NOT NULL,
  schema_id uuid NOT NULL,
  thread_table_name text,
  message_table_name text,
  task_table_name text
);
GRANT SELECT ON metaschema_modules_public.agent_chat_module TO administrator, authenticated, anonymous;

CREATE SCHEMA "simple-pets-agent-public";
GRANT USAGE ON SCHEMA "simple-pets-agent-public" TO administrator, authenticated, anonymous;

CREATE TABLE "simple-pets-agent-public".threads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  mode text NOT NULL,
  model text,
  system_prompt text,
  title text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON "simple-pets-agent-public".threads TO authenticated;

SET session_replication_role TO replica;

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, is_public)
VALUES
  ('6dba0101-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'agent_public', 'simple-pets-agent-public', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO metaschema_modules_public.agent_chat_module (id, database_id, schema_id, thread_table_name, message_table_name)
VALUES
  ('6dba0102-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dba0101-0000-4000-8000-000000000001', 'threads', 'messages')
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;
