-- Deploy schemas/meta_public/tables/invites_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.invites_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    
    schema_id uuid NOT NULL DEFAULT uuid_nil(),
    private_schema_id uuid NOT NULL DEFAULT uuid_nil(),

    emails_table_id uuid NOT NULL DEFAULT uuid_nil(),
    users_table_id uuid NOT NULL DEFAULT uuid_nil(),

    invites_table_id uuid NOT NULL DEFAULT uuid_nil(),
    claimed_invites_table_id uuid NOT NULL DEFAULT uuid_nil(),
    
    invites_table_name text NOT NULL DEFAULT '',
    claimed_invites_table_name text NOT NULL DEFAULT '',
    submit_invite_code_function text NOT NULL DEFAULT '',

    prefix text NULL,

    membership_type int NOT NULL,
    -- if this is NOT NULL, then we add entity_id 
    -- e.g. limits to the app itself are considered global owned by app and no explicit owner
    entity_table_id uuid NULL,

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT invites_table_fkey FOREIGN KEY (invites_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT emails_table_fkey FOREIGN KEY (emails_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT users_table_fkey FOREIGN KEY (users_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT entity_table_fkey FOREIGN KEY (entity_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT claimed_invites_table_fkey FOREIGN KEY (claimed_invites_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT pschema_fkey FOREIGN KEY (private_schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT emails_table_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT users_table_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT invites_table_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT claimed_invites_table_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT schema_fkey ON meta_public.invites_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT pschema_fkey ON meta_public.invites_module IS E'@omit manyToMany';
CREATE INDEX invites_module_database_id_idx ON meta_public.invites_module ( database_id );

COMMIT;
