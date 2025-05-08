-- Deploy schemas/collections_public/tables/table/table to pg
-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table
-- requires: schemas/collections_public/tables/schema/table

BEGIN;
CREATE TABLE collections_public.table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),

  schema_id uuid NOT NULL,
  
  name text NOT NULL,

  label text,
  description text,
  
  smart_tags jsonb,
  
  is_system boolean DEFAULT FALSE, -- TODO DEPRECATE
  use_rls boolean NOT NULL DEFAULT FALSE,
  
  timestamps boolean NOT NULL DEFAULT FALSE,
  peoplestamps boolean NOT NULL DEFAULT FALSE,

  plural_name text,
  singular_name text,

  -- 

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
  
  UNIQUE (database_id, name)
);

ALTER TABLE collections_public.table ADD COLUMN
    inherits_id uuid NULL REFERENCES collections_public.table(id);

COMMENT ON CONSTRAINT schema_fkey ON collections_public.table IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.table IS E'@omit manyToMany';

CREATE INDEX table_schema_id_idx ON collections_public.table ( schema_id );
CREATE INDEX table_database_id_idx ON collections_public.table ( database_id );

COMMIT;

