-- Deploy schemas/collections_public/tables/trigger_function/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table

BEGIN;

CREATE TABLE collections_public.trigger_function (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL,

  name text NOT NULL,
  code text,

  --
  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  UNIQUE (database_id, name)
);

COMMENT ON CONSTRAINT db_fkey ON collections_public.trigger_function IS E'@omit manyToMany';
CREATE INDEX trigger_function_database_id_idx ON collections_public.trigger_function ( database_id );

COMMIT;
