-- Deploy project-y:auth_roles to pg
-- requires: auth_users
-- requires: project-x:@x1.1.0

BEGIN;

CREATE TABLE auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    priority core.priority_enum DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Use core function to generate slug
CREATE TRIGGER generate_role_slug
    BEFORE INSERT OR UPDATE ON auth.roles
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION core.generate_slug(NEW.name);

CREATE TABLE auth.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

COMMIT;