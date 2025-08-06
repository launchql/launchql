-- Deploy schemas/meta_public/tables/apis/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/collections_public/tables/database/table 

BEGIN;

CREATE TABLE meta_public.apis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    name text NOT NULL,
    dbname text NOT NULL DEFAULT current_database(),
    role_name text NOT NULL DEFAULT 'authenticated',
    anon_role text NOT NULL DEFAULT 'anonymous',
    is_public boolean NOT NULL DEFAULT true,

    --

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    UNIQUE(database_id, name)
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.apis IS E'@omit manyToMany';
CREATE INDEX apis_database_id_idx ON meta_public.apis ( database_id );

COMMIT;
