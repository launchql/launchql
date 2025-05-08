-- Deploy schemas/collections_public/tables/database/table to pg

-- requires: schemas/collections_public/schema

BEGIN;

CREATE TABLE collections_public.database (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  owner_id uuid,
  schema_hash text,
  schema_name text,
  private_schema_name text,
  
  name text,
  label text,
  
  hash uuid,
  unique(schema_hash),
  unique(schema_name),
  unique(private_schema_name)
);

ALTER TABLE collections_public.database
  ADD CONSTRAINT db_namechk CHECK (char_length(name) > 2);

COMMENT ON COLUMN collections_public.database.schema_hash IS '@omit';
-- COMMENT ON COLUMN collections_public.database.schema_name IS '@omit';
-- COMMENT ON COLUMN collections_public.database.private_schema_name IS '@omit';

COMMIT;
