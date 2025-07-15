-- Deploy project-z:app_analytics to pg
-- requires: app_workflows
-- requires: project-x:@x2.0.0
-- requires: project-y:@y2.0.0

-- Analytics tables using advanced features from core v2.0.0 and auth v2.0.0
CREATE TABLE app.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES app.organizations(id),
    project_id UUID REFERENCES app.projects(id),
    workflow_id UUID REFERENCES app.workflows(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE TABLE app.analytics_metrics (
    id UUID DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create first partition
CREATE TABLE app.analytics_metrics_2024_01 PARTITION OF app.analytics_metrics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Use permission system to control analytics access
CREATE OR REPLACE FUNCTION app.log_analytics_event(
    p_event_type TEXT,
    p_event_data JSONB,
    p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    -- Check if user has analytics permission
    IF p_user_id IS NOT NULL AND NOT auth.has_permission(p_user_id, 'analytics', 'write') THEN
        RAISE EXCEPTION 'User lacks analytics write permission';
    END IF;
    
    INSERT INTO app.analytics_events (event_type, event_data, user_id)
    VALUES (p_event_type, p_event_data, p_user_id)
    RETURNING id INTO v_event_id;
    
    -- Store in config for rate limiting
    INSERT INTO core.config (key, value, description)
    VALUES (
        'analytics.last_event.' || COALESCE(p_user_id::TEXT, 'anonymous'),
        jsonb_build_object('event_id', v_event_id, 'timestamp', NOW()),
        'Last analytics event for rate limiting'
    )
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = NOW();
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers
CREATE TRIGGER audit_analytics_events
    AFTER INSERT OR UPDATE OR DELETE ON app.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION core.audit_trigger();
