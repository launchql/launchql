-- Deploy schemas/meta_public/tables/limits_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.limits_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    --
    schema_id uuid NOT NULL DEFAULT uuid_nil(),
    private_schema_id uuid NOT NULL DEFAULT uuid_nil(),
    ---
    table_id uuid NOT NULL DEFAULT uuid_nil(),
    table_name text NOT NULL DEFAULT '',

    default_table_id uuid NOT NULL DEFAULT uuid_nil(),
    default_table_name text NOT NULL DEFAULT '',
    -- 

    limit_increment_function text NOT NULL DEFAULT '',
    limit_decrement_function text NOT NULL DEFAULT '',
    limit_increment_trigger text NOT NULL DEFAULT '',
    limit_decrement_trigger text NOT NULL DEFAULT '',
    limit_update_trigger text NOT NULL DEFAULT '',
    limit_check_function text NOT NULL DEFAULT '',
    
    prefix text NULL,

    membership_type int NOT NULL,
    -- if this is NOT NULL, then we add entity_id 
    -- e.g. limits to the app itself are considered global owned by app and no explicit owner
    entity_table_id uuid NULL,

    -- required tables    
    actor_table_id uuid NOT NULL DEFAULT uuid_nil(),
     
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT private_schema_fkey FOREIGN KEY (private_schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT default_table_fkey FOREIGN KEY (default_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT entity_table_fkey FOREIGN KEY (entity_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT actor_table_fkey FOREIGN KEY (actor_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE

);

COMMENT ON CONSTRAINT schema_fkey ON meta_public.limits_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT private_schema_fkey ON meta_public.limits_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT db_fkey ON meta_public.limits_module IS E'@omit manyToMany';
CREATE INDEX limits_module_database_id_idx ON meta_public.limits_module ( database_id );

COMMENT ON CONSTRAINT table_fkey
     ON meta_public.limits_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT default_table_fkey
     ON meta_public.limits_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT actor_table_fkey
     ON meta_public.limits_module IS E'@omit manyToMany';

COMMIT;
