-- Deploy project-z:app_workflows to pg
-- requires: app_entities
-- requires: project-y:auth_roles

BEGIN;

CREATE TABLE app.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status core.status_enum DEFAULT 'active',
    required_role_id UUID REFERENCES auth.roles(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES app.workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    action JSONB NOT NULL,
    requires_permission BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_id, step_number)
);

-- Function to check workflow access
CREATE OR REPLACE FUNCTION app.can_execute_workflow(
    p_user_id UUID,
    p_workflow_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_required_role_id UUID;
BEGIN
    SELECT required_role_id INTO v_required_role_id
    FROM app.workflows
    WHERE id = p_workflow_id;
    
    IF v_required_role_id IS NULL THEN
        RETURN true;
    END IF;
    
    RETURN EXISTS (
        SELECT 1
        FROM auth.user_roles
        WHERE user_id = p_user_id
          AND role_id = v_required_role_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;