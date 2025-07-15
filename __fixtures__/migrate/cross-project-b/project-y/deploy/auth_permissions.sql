-- Deploy project-y:auth_permissions to pg
-- requires: auth_roles
-- requires: project-x:core_extensions

BEGIN;

CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource, action)
);

CREATE TABLE auth.role_permissions (
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Function to check user permissions
CREATE OR REPLACE FUNCTION auth.has_permission(
    p_user_id UUID,
    p_resource TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.user_roles ur
        JOIN auth.role_permissions rp ON ur.role_id = rp.role_id
        JOIN auth.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
          AND p.resource = p_resource
          AND p.action = p_action
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Store permission config in core.config
INSERT INTO core.config (key, value, description)
VALUES ('auth.permissions.cache_ttl', '{"seconds": 300}', 'Permission cache TTL in seconds');

COMMIT;