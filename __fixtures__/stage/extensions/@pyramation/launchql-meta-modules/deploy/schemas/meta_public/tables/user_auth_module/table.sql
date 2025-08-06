-- Deploy schemas/meta_public/tables/user_auth_module/table to pg

-- requires: schemas/meta_public/schema

BEGIN;

CREATE TABLE meta_public.user_auth_module (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    database_id uuid NOT NULL,

    schema_id uuid NOT NULL DEFAULT uuid_nil(),
    emails_table_id uuid NOT NULL DEFAULT uuid_nil(),
    users_table_id uuid NOT NULL DEFAULT uuid_nil(),
    secrets_table_id uuid NOT NULL DEFAULT uuid_nil(),
    encrypted_table_id uuid NOT NULL DEFAULT uuid_nil(),
    tokens_table_id uuid NOT NULL DEFAULT uuid_nil(),

    audits_table_id uuid NOT NULL DEFAULT uuid_nil(),
    audits_table_name text NOT NULL DEFAULT 'audit_logs',

    -- api_id uuid NOT NULL REFERENCES meta_public.apis (id),

    sign_in_function text NOT NULL DEFAULT 'login',
    sign_up_function text NOT NULL DEFAULT 'register',
    sign_out_function text NOT NULL DEFAULT 'logout',
    set_password_function text NOT NULL DEFAULT 'set_password',
    reset_password_function text NOT NULL DEFAULT 'reset_password',
    forgot_password_function text NOT NULL DEFAULT 'forgot_password',
    send_verification_email_function text NOT NULL DEFAULT 'send_verification_email',
    verify_email_function text NOT NULL DEFAULT 'verify_email',
    
    verify_password_function text NOT NULL DEFAULT 'verify_password',
    check_password_function text NOT NULL DEFAULT 'check_password',

    send_account_deletion_email_function text NOT NULL DEFAULT 'send_account_deletion_email',
    delete_account_function text NOT NULL DEFAULT 'confirm_delete_account',

    sign_in_one_time_token_function text NOT NULL DEFAULT 'login_one_time_token',
    one_time_token_function text NOT NULL DEFAULT 'one_time_token',
    extend_token_expires text NOT NULL DEFAULT 'extend_token_expires',

    -- UNIQUE(api_id),

    CONSTRAINT db_fkey FOREIGN KEY (database_id) REFERENCES collections_public.database (id) ON DELETE CASCADE,
    CONSTRAINT schema_fkey FOREIGN KEY (schema_id) REFERENCES collections_public.schema (id) ON DELETE CASCADE,
    CONSTRAINT email_table_fkey FOREIGN KEY (emails_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT users_table_fkey FOREIGN KEY (users_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT secrets_table_fkey FOREIGN KEY (secrets_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT encrypted_table_fkey FOREIGN KEY (encrypted_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE,
    CONSTRAINT tokens_table_fkey FOREIGN KEY (tokens_table_id) REFERENCES collections_public.table (id) ON DELETE CASCADE
);

COMMENT ON CONSTRAINT schema_fkey ON meta_public.user_auth_module IS E'@omit manyToMany';
COMMENT ON CONSTRAINT db_fkey ON meta_public.user_auth_module IS E'@omit manyToMany';
CREATE INDEX user_auth_module_database_id_idx ON meta_public.user_auth_module ( database_id );

COMMENT ON CONSTRAINT email_table_fkey
     ON meta_public.user_auth_module IS E'@omit';
COMMENT ON CONSTRAINT users_table_fkey
     ON meta_public.user_auth_module IS E'@omit';
COMMENT ON CONSTRAINT secrets_table_fkey
     ON meta_public.user_auth_module IS E'@omit';
COMMENT ON CONSTRAINT encrypted_table_fkey
     ON meta_public.user_auth_module IS E'@omit';
COMMENT ON CONSTRAINT tokens_table_fkey
     ON meta_public.user_auth_module IS E'@omit';

COMMIT;
