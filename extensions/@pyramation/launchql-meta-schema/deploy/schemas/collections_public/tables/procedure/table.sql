-- Deploy schemas/collections_public/tables/procedure/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table

BEGIN;

CREATE TABLE collections_public.procedure (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),

  name text NOT NULL,

  -- MAYBE MAKE A SPECIAL RLS functions for policy making...

  -- can we make this all JSON?
  argnames text[],
  argtypes text[],
  argdefaults text[],

  lang_name text,
  definition text,
  --
  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,

  UNIQUE (database_id, name)
);

COMMENT ON CONSTRAINT db_fkey ON collections_public.procedure IS E'@omit manyToMany';
CREATE INDEX procedure_database_id_idx ON collections_public.procedure ( database_id );

COMMIT;
