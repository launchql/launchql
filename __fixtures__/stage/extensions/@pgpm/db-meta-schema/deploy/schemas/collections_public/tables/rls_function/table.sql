-- Deploy schemas/collections_public/tables/rls_function/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table

BEGIN;

CREATE TABLE collections_public.rls_function (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),

  table_id uuid NOT NULL,

  name text,
  label text,
  description text,

  data jsonb,

  inline boolean default false,
  security int default 0, -- 0 = invoker, 1 = definer (only when inline is false can we apply this)

  --

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

  UNIQUE (database_id, name)
);

COMMENT ON CONSTRAINT db_fkey ON collections_public.rls_function IS E'@omit manyToMany';
COMMENT ON CONSTRAINT table_fkey ON collections_public.rls_function IS E'@omit manyToMany';
CREATE INDEX rls_function_table_id_idx ON collections_public.rls_function ( table_id );
CREATE INDEX rls_function_database_id_idx ON collections_public.rls_function ( database_id );

COMMIT;
