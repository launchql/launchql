-- Deploy schemas/meta_public/tables/default_ids_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.default_ids_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.default_ids_module IS E'@omit manyToMany';
CREATE INDEX default_ids_module_database_id_idx ON meta_public.default_ids_module ( database_id );

COMMIT;
