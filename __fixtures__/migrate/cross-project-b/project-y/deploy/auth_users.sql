-- Deploy project-y:auth_users to pg
-- requires: auth_schema
-- requires: project-x:core_types

BEGIN;

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status core.status_enum DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Add audit trigger from core
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION core.audit_trigger();

-- Add timestamp update trigger
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION core.update_timestamp();

COMMIT;