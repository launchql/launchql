-- Deploy schemas/collections_public/tables/schema_grant/table to pg

-- requires: schemas/collections_public/schema
-- requires: schemas/collections_public/tables/schema/table

BEGIN;

CREATE TABLE collections_public.schema_grant (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL DEFAULT uuid_nil(),
    
    schema_id uuid NOT NULL,
    grantee_name text NOT NULL,
    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE

);

COMMENT ON CONSTRAINT schema_fkey ON collections_public.schema_grant IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON collections_public.schema_grant IS E'@omit manyToMany';

CREATE INDEX schema_grant_schema_id_idx ON collections_public.schema_grant ( schema_id );
CREATE INDEX schema_grant_database_id_idx ON collections_public.schema_grant ( database_id );

COMMIT;
