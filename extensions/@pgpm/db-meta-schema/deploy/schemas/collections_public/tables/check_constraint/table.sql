-- Deploy schemas/collections_public/tables/check_constraint/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table 
-- requires: schemas/collections_public/tables/table/table 

BEGIN;

CREATE TABLE collections_public.check_constraint (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL DEFAULT uuid_nil(),
  
  table_id uuid NOT NULL,
  name text,
  type text,
  field_ids uuid[] NOT NULL,
  expr jsonb,
  --

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

  UNIQUE (table_id, name),
  CHECK (field_ids <> '{}')
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.check_constraint IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.check_constraint IS E'@omit manyToMany';

CREATE INDEX check_constraint_table_id_idx ON collections_public.check_constraint ( table_id );
CREATE INDEX check_constraint_database_id_idx ON collections_public.check_constraint ( database_id );

COMMIT;
