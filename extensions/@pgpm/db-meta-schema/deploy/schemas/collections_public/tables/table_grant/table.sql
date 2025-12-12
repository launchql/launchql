-- Deploy schemas/collections_public/tables/table_grant/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/table/table

BEGIN;

CREATE TABLE collections_public.table_grant (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL DEFAULT uuid_nil(),
    
    table_id uuid NOT NULL,
    privilege text NOT NULL,
    role_name text NOT NULL,
    field_ids uuid[],
    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT table_fkey ON collections_public.table_grant IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.table_grant IS E'@omit manyToMany';

CREATE INDEX table_grant_table_id_idx ON collections_public.table_grant ( table_id );
CREATE INDEX table_grant_database_id_idx ON collections_public.table_grant ( database_id );

COMMIT;
