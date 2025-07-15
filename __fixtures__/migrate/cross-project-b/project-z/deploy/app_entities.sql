-- Deploy project-z:app_entities to pg
-- requires: app_schema
-- requires: project-y:auth_users

BEGIN;

CREATE TABLE app.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status core.status_enum DEFAULT 'active',
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status core.status_enum DEFAULT 'active',
    priority core.priority_enum DEFAULT 'medium',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Add triggers
CREATE TRIGGER update_organizations_timestamp
    BEFORE UPDATE ON app.organizations
    FOR EACH ROW
    EXECUTE FUNCTION core.update_timestamp();

CREATE TRIGGER update_projects_timestamp
    BEFORE UPDATE ON app.projects
    FOR EACH ROW
    EXECUTE FUNCTION core.update_timestamp();

COMMIT;