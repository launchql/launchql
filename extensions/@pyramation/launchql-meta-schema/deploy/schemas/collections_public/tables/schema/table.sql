-- Deploy schemas/collections_public/tables/schema/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/database/table

BEGIN;

CREATE TABLE collections_public.schema (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    
    database_id uuid NOT NULL,
    name text NOT NULL,
    schema_name text NOT NULL,
    label text,
    description text,
    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,

    UNIQUE (database_id, name),
    UNIQUE (schema_name)
);

-- TODO: build out services
-- COMMENT ON COLUMN collections_public.schema.schema_name IS '@omit';

ALTER TABLE collections_public.schema
  ADD CONSTRAINT schema_namechk CHECK (char_length(name) > 2);

COMMENT ON CONSTRAINT db_fkey ON collections_public.schema IS E'@omit manyToMany';
CREATE INDEX schema_database_id_idx ON collections_public.schema ( database_id );

COMMIT;
