-- Deploy project-z:app_reports to pg
-- requires: app_analytics

CREATE TABLE app.report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    query_template TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    required_permission TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID NOT NULL REFERENCES app.report_definitions(id) ON DELETE CASCADE,
    schedule_cron TEXT NOT NULL,
    recipients JSONB NOT NULL DEFAULT '[]',
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    status core.status_enum DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view for common analytics
CREATE MATERIALIZED VIEW app.daily_activity_summary AS
SELECT 
    DATE(created_at) as activity_date,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_events,
    COUNT(DISTINCT organization_id) as active_orgs,
    COUNT(DISTINCT project_id) as active_projects
FROM app.analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at);

CREATE INDEX idx_daily_activity_date ON app.daily_activity_summary(activity_date);

-- Function to generate reports
CREATE OR REPLACE FUNCTION app.generate_report(
    p_report_id UUID,
    p_parameters JSONB DEFAULT '{}'
) RETURNS TABLE (result JSONB) AS $$
DECLARE
    v_query TEXT;
    v_permission TEXT;
BEGIN
    SELECT query_template, required_permission 
    INTO v_query, v_permission
    FROM app.report_definitions
    WHERE id = p_report_id;
    
    IF v_permission IS NOT NULL THEN
        IF NOT auth.has_permission(current_setting('app.current_user_id')::UUID, 'reports', v_permission) THEN
            RAISE EXCEPTION 'Insufficient permissions for report %', p_report_id;
        END IF;
    END IF;
    
    -- Execute dynamic query (simplified for example)
    RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
