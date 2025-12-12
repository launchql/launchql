-- Deploy schemas/meta_public/tables/field_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.field_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    
    private_schema_id uuid NOT NULL DEFAULT uuid_nil(),
    
    table_id uuid NOT NULL DEFAULT uuid_nil(),
    field_id uuid NOT NULL DEFAULT uuid_nil(),

    -- data = '{"regexp":"^kjhsdkjhsd$"}'
    -- data = '{"min":10, "max": 20}'
    data jsonb NOT NULL DEFAULT '{}',

    triggers text[],
    functions text[],

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT field_fkey FOREIGN KEY (field_id) REFERENCES collections_public.field (id) ON DELETE CASCADE,
    CONSTRAINT private_schema_fkey FOREIGN KEY (private_schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT private_schema_fkey ON meta_public.field_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT table_fkey ON meta_public.field_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT field_fkey ON meta_public.field_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON meta_public.field_module IS E'@omit manyToMany';
CREATE INDEX field_module_database_id_idx ON meta_public.field_module ( database_id );

COMMIT;

