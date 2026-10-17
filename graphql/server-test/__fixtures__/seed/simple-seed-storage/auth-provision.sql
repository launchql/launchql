-- Alice's session token and her buckets table's provisioner, so the
-- provisionBucket mutation runs end to end as `authenticated`.
--
-- `authenticate` is a stand-in auth module accepting the one fixture token.
-- `app_buckets_provision` is the storage_module generator's output
-- (metaschema_generators.storage_module, constructive-db #4088): it stamps
-- provision_requested_at as the caller and the bucket's UPDATE job trigger
-- enqueues the reconciler. This fixture carries no job trigger, so here it
-- only stamps the row. Copied from pg_get_functiondef with only the schema
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
 RETURNS "simple-storage-public".app_buckets
 LANGUAGE plpgsql
AS $function$
DECLARE
  bucket "simple-storage-public".app_buckets;
BEGIN
  UPDATE "simple-storage-public".app_buckets SET
  provision_requested_at = clock_timestamp()
  WHERE
    id = bucket_id;
  IF NOT (FOUND) THEN
    PERFORM errors.raise_error('JOB_SUBJECT_NOT_FOUND', jsonb_build_object('id', bucket_id), 'public');
  END IF;
  SELECT *
  FROM "simple-storage-public".app_buckets AS requested
  WHERE
    requested.id = bucket_id INTO bucket;
  RETURN bucket;
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
