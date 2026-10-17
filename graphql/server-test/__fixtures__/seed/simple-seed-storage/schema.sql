-- Schema creation for simple-seed-storage test scenario
-- Creates storage schemas (buckets + files) for three tenants:
--   Alice  (no RLS), Bob (moderate RLS), Mallory (strictest RLS)

-- =====================================================
-- Helper: create a storage schema with buckets + files tables
-- =====================================================

CREATE FUNCTION _test_create_storage_schema(schema_name text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name || '-private');

  EXECUTE format('GRANT USAGE ON SCHEMA %I TO administrator, authenticated, anonymous', schema_name);
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO administrator, authenticated, anonymous', schema_name || '-private');

  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO administrator', schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT USAGE ON SEQUENCES TO administrator, authenticated', schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON FUNCTIONS TO administrator, authenticated, anonymous', schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON FUNCTIONS TO administrator, authenticated, anonymous', schema_name || '-private');

  -- Buckets table
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I.app_buckets (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       key text NOT NULL,
       type text NOT NULL DEFAULT ''private'',
       is_public boolean NOT NULL DEFAULT false,
       allowed_mime_types text[] NULL,
       max_file_size bigint NULL,
       allow_custom_keys boolean NOT NULL DEFAULT false,
       allowed_origins text[] NULL,
       physical_name text NULL,
       provision_requested_at timestamptz NULL,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now(),
       UNIQUE (key)
     )', schema_name);

  EXECUTE format(
    'COMMENT ON TABLE %I.app_buckets IS E''@storageBuckets\nStorage buckets table''',
    schema_name);

  -- Files table
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I.app_files (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       bucket_id uuid NOT NULL REFERENCES %I.app_buckets(id),
       key text NOT NULL,
       content_hash text NOT NULL,
       mime_type text NOT NULL,
       size bigint,
       filename text,
       owner_id uuid,
       is_public boolean NOT NULL DEFAULT false,
       previous_version_id uuid REFERENCES %I.app_files(id),
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now(),
       UNIQUE (bucket_id, key)
     )', schema_name, schema_name, schema_name);

  EXECUTE format(
    'COMMENT ON TABLE %I.app_files IS E''@storageFiles\nStorage files table''',
    schema_name);

  -- Grant CRUD to all roles
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I.app_buckets TO administrator, authenticated, anonymous', schema_name);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I.app_files TO administrator, authenticated, anonymous', schema_name);

  EXECUTE format($sql$
    CREATE FUNCTION %I.app_files_record_file(
      bucket_id uuid,
      key text,
      content_hash text,
      mime_type text,
      size bigint,
      filename text,
      upload jsonb,
      status text DEFAULT 'requested',
      previous_version_id uuid DEFAULT NULL
    ) RETURNS %I.app_files
    LANGUAGE plpgsql
    SECURITY INVOKER
    VOLATILE
    AS $function$
    DECLARE
      v_row %I.app_files;
    BEGIN
      INSERT INTO %I.app_files (
        bucket_id,
        key,
        content_hash,
        mime_type,
        size,
        filename,
        is_public,
        previous_version_id
      )
      SELECT
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        b.is_public,
        $9
      FROM %I.app_buckets b
      WHERE b.id = $1
      RETURNING * INTO v_row;
      RETURN v_row;
    END;
    $function$;
  $sql$, schema_name || '-private', schema_name, schema_name, schema_name, schema_name);

  EXECUTE format(
    'GRANT EXECUTE ON FUNCTION %I.app_files_record_file(uuid, text, text, text, bigint, text, jsonb, text, uuid) TO administrator, authenticated, anonymous',
    schema_name || '-private');
END;
$$;

-- =====================================================
-- ALICE (no RLS — wide open)
-- =====================================================

SELECT _test_create_storage_schema('simple-storage-public');

-- =====================================================
-- BOB (moderate RLS)
--   Buckets: anonymous sees public only
--   Files:   anonymous can SELECT public-bucket files + INSERT; no UPDATE/DELETE
-- =====================================================

SELECT _test_create_storage_schema('bob-storage-public');

ALTER TABLE "bob-storage-public".app_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_public_buckets ON "bob-storage-public".app_buckets
  FOR SELECT TO anonymous
  USING (is_public = true);

CREATE POLICY admin_all_buckets ON "bob-storage-public".app_buckets
  FOR ALL TO administrator
  USING (true)
  WITH CHECK (true);

ALTER TABLE "bob-storage-public".app_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_public_files ON "bob-storage-public".app_files
  FOR SELECT TO anonymous
  USING (
    bucket_id IN (
      SELECT id FROM "bob-storage-public".app_buckets WHERE is_public = true
    )
  );

-- Anonymous can insert into any bucket (for upload testing)
CREATE POLICY anon_insert_files ON "bob-storage-public".app_files
  FOR INSERT TO anonymous
  WITH CHECK (true);

-- No UPDATE or DELETE policies for anonymous — absence means denied.
-- This prevents Supabase-style attacks where anonymous could:
--   - change a file's bucket_id from private to public
--   - flip is_public flags
--   - delete other users' files

CREATE POLICY admin_all_files ON "bob-storage-public".app_files
  FOR ALL TO administrator
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MALLORY (strictest RLS — anonymous can only SELECT)
-- =====================================================

SELECT _test_create_storage_schema('mallory-storage-public');

ALTER TABLE "mallory-storage-public".app_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_buckets ON "mallory-storage-public".app_buckets
  FOR SELECT TO anonymous
  USING (true);

CREATE POLICY admin_all_buckets ON "mallory-storage-public".app_buckets
  FOR ALL TO administrator
  USING (true)
  WITH CHECK (true);

ALTER TABLE "mallory-storage-public".app_files ENABLE ROW LEVEL SECURITY;

-- Anonymous can only read (no INSERT/UPDATE/DELETE at all)
CREATE POLICY anon_read_files ON "mallory-storage-public".app_files
  FOR SELECT TO anonymous
  USING (true);

CREATE POLICY admin_all_files ON "mallory-storage-public".app_files
  FOR ALL TO administrator
  USING (true)
  WITH CHECK (true);

-- Clean up helper
DROP FUNCTION _test_create_storage_schema(text);
