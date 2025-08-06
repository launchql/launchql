-- Deploy schemas/meta_public/tables/denormalized_table_field/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.denormalized_table_field (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,

    table_id uuid NOT NULL,
    field_id uuid NOT NULL,

    set_ids uuid[],

    ref_table_id uuid NOT NULL,
    ref_field_id uuid NOT NULL,
    ref_ids uuid[],

    use_updates bool NOT NULL DEFAULT TRUE,
    update_defaults bool NOT NULL DEFAULT TRUE, 

    func_name text NULL,
    func_order int NOT NULL DEFAULT 0,

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT table_fkey FOREIGN KEY (table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT ref_table_fkey FOREIGN KEY (ref_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT field_fkey FOREIGN KEY (field_id) REFERENCES collections_public.field (id) ON DELETE CASCADE,
    CONSTRAINT ref_field_fkey FOREIGN KEY (ref_field_id) REFERENCES collections_public.field (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.denormalized_table_field IS E'@omit manyToMany';
COMMENT ON CONSTRAINT table_fkey ON meta_public.denormalized_table_field IS E'@omit manyToMany';
COMMENT ON CONSTRAINT ref_table_fkey ON meta_public.denormalized_table_field IS E'@omit manyToMany';
COMMENT ON CONSTRAINT field_fkey ON meta_public.denormalized_table_field IS E'@omit manyToMany';
COMMENT ON CONSTRAINT ref_field_fkey ON meta_public.denormalized_table_field IS E'@omit manyToMany';
CREATE INDEX denormalized_table_field_database_id_idx ON meta_public.denormalized_table_field ( database_id );

COMMIT;
