-- Deploy schemas/collections_public/tables/database_extension/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/extension/table 
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE collections_public.database_extension (
  name text NOT NULL PRIMARY KEY,
  database_id uuid NOT NULL,

  --

  CONSTRAINT ext_fkey FOREIGN KEY (name) REFERENCES collections_public.extension (name) ON DELETE CASCADE,
  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  UNIQUE (database_id, name)
);

COMMENT ON CONSTRAINT db_fkey ON collections_public.database_extension IS E'@omit manyToMany';
CREATE INDEX database_extension_database_id_idx ON collections_public.database_extension ( database_id );

COMMIT;
