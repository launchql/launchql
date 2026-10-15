-- Alice's session token and her buckets table's provisioner, so the
-- provisionBucket mutation runs end to end as `authenticated`.
--
-- `authenticate` is a stand-in auth module accepting the one fixture token.
-- `app_buckets_provision` is the storage_module generator's output
-- (metaschema_generators.storage_module -> data_job_trigger
-- `enqueue_function` -> ast_plpgsql_helpers.job_trigger, constructive-db #4067)
-- for an app-scope module, copied from pg_get_functiondef with only the schema
-- names replaced (and CREATE OR REPLACE written as CREATE). Keep it in sync
-- with that generator; do not edit it by hand.
--
-- Compose after simple-seed-storage/schema.sql and test-data.sql.

CREATE SCHEMA "simple-storage-auth-private";
GRANT USAGE ON SCHEMA "simple-storage-auth-private" TO authenticated, anonymous;

CREATE FUNCTION "simple-storage-auth-private".authenticate(token_str text)
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
    'aaaaaaaa-0000-4000-8000-000000000003'::uuid,
    'bbbbbbbb-0000-4000-8000-000000000003'::uuid,
    NULL::uuid,
    'full'::text,
    'session'::text,
    NULL::uuid,
    NULL::uuid,
    NULL::uuid,
    NULL::text
  WHERE token_str = 'session-token';
$$ LANGUAGE sql STABLE;

CREATE FUNCTION "simple-storage-public-private".app_buckets_provision(bucket_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
  subject_row "simple-storage-public".app_buckets;
  job_id bigint;
BEGIN
  SELECT *
  FROM "simple-storage-public".app_buckets AS subject
  WHERE
    subject.id = bucket_id
  FOR UPDATE INTO subject_row;
  IF NOT (FOUND) THEN
    PERFORM errors.raise_error('JOB_SUBJECT_NOT_FOUND', jsonb_build_object('id', bucket_id), 'public');
  END IF;
  SELECT (app_jobs.add_job(identifier:='storage:provision_bucket', payload:=json_build_object('id', subject_row.id, 'scope', 'app'), queue_name:='bucket:' || subject_row.id::text, max_attempts:=25, priority:=0)).id INTO job_id;
  RETURN job_id;
END;
$function$;

REVOKE ALL ON FUNCTION "simple-storage-public-private".app_buckets_provision(uuid) FROM PUBLIC, anonymous, authenticated_client;
GRANT EXECUTE ON FUNCTION "simple-storage-public-private".app_buckets_provision(uuid) TO authenticated;

SET session_replication_role TO replica;

INSERT INTO metaschema_public.schema (id, database_id, name, schema_name, is_public)
VALUES
  ('6dbb0001-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', 'auth_private', 'simple-storage-auth-private', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO metaschema_public.function (id, database_id, schema_id, name)
VALUES
  ('6dbb0002-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9', '6dbb0001-0000-4000-8000-000000000001', 'authenticate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO routing_public.rls_settings
  (id, database_id, authenticate_schema_id, authenticate_function_id, authenticate_strict_function_id)
VALUES
  ('6dbb0003-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
   '6dbb0001-0000-4000-8000-000000000001', '6dbb0002-0000-4000-8000-000000000001', '6dbb0002-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;
