-- Deploy schemas/collections_public/tables/policy/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/table/table

BEGIN;

CREATE TABLE collections_public.policy (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),

  table_id uuid NOT NULL,
  name text,
  role_name text,
  privilege text,

  -- using_expression text,
  -- check_expression text,
  -- policy_text text,

  permissive boolean default true,
  disabled boolean default false,

  template text,
  data jsonb,

  --

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

  UNIQUE (table_id, name)
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.policy IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.policy IS E'@omit manyToMany';

CREATE INDEX policy_table_id_idx ON collections_public.policy ( table_id );
CREATE INDEX policy_database_id_idx ON collections_public.policy ( database_id );

COMMIT;
