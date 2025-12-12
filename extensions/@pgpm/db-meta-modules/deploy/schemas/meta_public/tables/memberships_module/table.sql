-- Deploy schemas/meta_public/tables/memberships_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.memberships_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    --
    schema_id uuid NOT NULL DEFAULT uuid_nil(),
    private_schema_id uuid NOT NULL DEFAULT uuid_nil(),

    memberships_table_id uuid NOT NULL DEFAULT uuid_nil(),
    memberships_table_name text NOT NULL DEFAULT '',

    members_table_id uuid NOT NULL DEFAULT uuid_nil(),
    members_table_name text NOT NULL DEFAULT '',

    membership_defaults_table_id uuid NOT NULL DEFAULT uuid_nil(),
    membership_defaults_table_name text NOT NULL DEFAULT '',

    grants_table_id uuid NOT NULL DEFAULT uuid_nil(),
    grants_table_name text NOT NULL DEFAULT '',

    -- required tables    
    actor_table_id uuid NOT NULL DEFAULT uuid_nil(),
    limits_table_id uuid NOT NULL DEFAULT uuid_nil(),
    default_limits_table_id uuid NOT NULL DEFAULT uuid_nil(),
    permissions_table_id uuid NOT NULL DEFAULT uuid_nil(),
    default_permissions_table_id uuid NOT NULL DEFAULT uuid_nil(),
    acl_table_id uuid NOT NULL DEFAULT uuid_nil(),

    admin_grants_table_id uuid NOT NULL DEFAULT uuid_nil(),
    admin_grants_table_name text NOT NULL DEFAULT '',

    owner_grants_table_id uuid NOT NULL DEFAULT uuid_nil(),
    owner_grants_table_name text NOT NULL DEFAULT '',

    membership_type int NOT NULL,

    -- if this is NOT NULL, then we add entity_id 
    -- e.g. memberships to the app itself are considered global owned by app and no explicit owner
    entity_table_id uuid NULL,
    entity_table_owner_id uuid NULL,

    prefix text NULL,

    --

    actor_mask_check text NOT NULL DEFAULT '',
    actor_perm_check text NOT NULL DEFAULT '',
    entity_ids_by_mask text NULL,
    entity_ids_by_perm text NULL,
    entity_ids_function text NULL,

    -- 
     
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT private_schema_fkey FOREIGN KEY (private_schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,

    CONSTRAINT memberships_table_fkey FOREIGN KEY (memberships_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT membership_defaults_table_fkey FOREIGN KEY (membership_defaults_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT members_table_fkey FOREIGN KEY (members_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT grants_table_fkey FOREIGN KEY (grants_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT acl_table_fkey FOREIGN KEY (acl_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

    CONSTRAINT entity_table_fkey FOREIGN KEY (entity_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT entity_table_owner_fkey FOREIGN KEY (entity_table_owner_id) REFERENCES collections_public.field (id) ON DELETE CASCADE,
    CONSTRAINT actor_table_fkey FOREIGN KEY (actor_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT limits_table_fkey FOREIGN KEY (limits_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT default_limits_table_fkey FOREIGN KEY (default_limits_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,

    CONSTRAINT permissions_table_fkey FOREIGN KEY (permissions_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT default_permissions_table_fkey FOREIGN KEY (default_permissions_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT schema_fkey ON meta_public.memberships_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT private_schema_fkey ON meta_public.memberships_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON meta_public.memberships_module IS E'@omit manyToMany';
CREATE INDEX memberships_module_database_id_idx ON meta_public.memberships_module ( database_id );

COMMENT ON CONSTRAINT entity_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT entity_table_owner_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT memberships_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT members_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT membership_defaults_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT grants_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT acl_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT actor_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT limits_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT default_limits_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT permissions_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMENT ON CONSTRAINT default_permissions_table_fkey
     ON meta_public.memberships_module IS E'@omit manyToMany';

COMMIT;
