-- Deploy schemas/collections_public/tables/trigger/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/table/table

BEGIN;

-- https://www.postgresql.org/docs/12/sql-createtrigger.html

CREATE TABLE collections_public.trigger (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),
  
  table_id uuid NOT NULL,
  name text NOT NULL,
  event text, -- INSERT, UPDATE, DELETE, or TRUNCATE
  function_name text,
  --

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

  UNIQUE(table_id, name)
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.trigger IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.trigger IS E'@omit manyToMany';

CREATE INDEX trigger_table_id_idx ON collections_public.trigger ( table_id );
CREATE INDEX trigger_database_id_idx ON collections_public.trigger ( database_id );

COMMIT;
