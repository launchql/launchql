-- Deploy schemas/meta_public/tables/crypto_auth_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.crypto_auth_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,
    
    schema_id uuid NOT NULL DEFAULT uuid_nil(),

    users_table_id uuid NOT NULL DEFAULT uuid_nil(),
    tokens_table_id uuid NOT NULL DEFAULT uuid_nil(),
    secrets_table_id uuid NOT NULL DEFAULT uuid_nil(),
    addresses_table_id uuid NOT NULL DEFAULT uuid_nil(),

    user_field text NOT NULL,

    crypto_network text NOT NULL DEFAULT 'BTC',
    sign_in_request_challenge text NOT NULL DEFAULT 'sign_in_request_challenge',
    sign_in_record_failure text NOT NULL DEFAULT 'sign_in_record_failure',
    sign_up_with_key text NOT NULL DEFAULT 'sign_up_with_key',
    sign_in_with_challenge text NOT NULL DEFAULT 'sign_in_with_challenge',

    --
    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT secrets_table_fkey FOREIGN KEY (secrets_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT users_table_fkey FOREIGN KEY (users_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT tokens_table_fkey FOREIGN KEY (tokens_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT db_fkey ON meta_public.crypto_auth_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT secrets_table_fkey ON meta_public.crypto_auth_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT users_table_fkey ON meta_public.crypto_auth_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT tokens_table_fkey ON meta_public.crypto_auth_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT schema_fkey ON meta_public.crypto_auth_module IS E'@omit manyToMany';
CREATE INDEX crypto_auth_module_database_id_idx ON meta_public.crypto_auth_module ( database_id );

COMMIT;
