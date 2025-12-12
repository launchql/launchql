-- Deploy schemas/meta_public/tables/rls_module/table to pg

-- requires: schemas/meta_public/schema
-- requires: schemas/meta_public/tables/apis/table

BEGIN;

CREATE TABLE meta_public.rls_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,

    api_id uuid NOT NULL DEFAULT uuid_nil(),
    schema_id uuid NOT NULL DEFAULT uuid_nil(),
    private_schema_id uuid NOT NULL DEFAULT uuid_nil(),
    tokens_table_id uuid NOT NULL DEFAULT uuid_nil(),
    users_table_id uuid NOT NULL DEFAULT uuid_nil(),

    --
    
    authenticate text NOT NULL DEFAULT 'authenticate',
    authenticate_strict text NOT NULL DEFAULT 'authenticate_strict',
    "current_role" text NOT NULL DEFAULT 'current_user',
    current_role_id text NOT NULL DEFAULT 'current_user_id',

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT api_fkey FOREIGN KEY (api_id) REFERENCES meta_public.apis (id) ON DELETE CASCADE,
    CONSTRAINT tokens_table_fkey FOREIGN KEY (tokens_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT users_table_fkey FOREIGN KEY (users_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT pschema_fkey FOREIGN KEY (private_schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,

    --
    CONSTRAINT api_id_uniq UNIQUE(api_id)
);

COMMENT ON CONSTRAINT api_fkey ON meta_public.rls_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT schema_fkey ON meta_public.rls_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT pschema_fkey ON meta_public.rls_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT db_fkey ON meta_public.rls_module IS E'@omit';
COMMENT ON CONSTRAINT tokens_table_fkey ON meta_public.rls_module IS E'@omit';
COMMENT ON CONSTRAINT users_table_fkey ON meta_public.rls_module IS E'@omit';
CREATE INDEX rls_module_database_id_idx ON meta_public.rls_module ( database_id );

COMMIT;
