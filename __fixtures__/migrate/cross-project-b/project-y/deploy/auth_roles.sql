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

-- Wrapper trigger function to generate slug using core.generate_slug(name)
CREATE OR REPLACE FUNCTION auth.set_role_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := core.generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger using the wrapper function
CREATE TRIGGER generate_role_slug
    BEFORE INSERT OR UPDATE ON auth.roles
    FOR EACH ROW
    EXECUTE FUNCTION auth.set_role_slug();

CREATE TABLE auth.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

COMMIT;
