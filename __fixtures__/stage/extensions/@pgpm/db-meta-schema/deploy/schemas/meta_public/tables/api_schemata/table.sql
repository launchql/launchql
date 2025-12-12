-- Deploy schemas/meta_public/tables/api_schemata/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.api_schemata (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  database_id uuid NOT NULL,
  schema_id uuid NOT NULL,
  api_id uuid NOT NULL,
  
  --

  CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
  CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
  CONSTRAINT api_fkey FOREIGN KEY (api_id) REFERENCES meta_public.apis (id) ON DELETE CASCADE,
  unique(api_id, schema_id)
);

-- COMMENT ON CONSTRAINT schema_fkey ON meta_public.api_schemata IS E'@omit manyToMany';
-- COMMENT ON CONSTRAINT api_fkey ON meta_public.api_schemata IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON meta_public.api_schemata IS E'@omit manyToMany';


CREATE INDEX api_schemata_database_id_idx ON meta_public.api_schemata ( database_id );
CREATE INDEX api_schemata_schema_id_idx ON meta_public.api_schemata ( schema_id );
CREATE INDEX api_schemata_api_id_idx ON meta_public.api_schemata ( api_id );

COMMIT;
