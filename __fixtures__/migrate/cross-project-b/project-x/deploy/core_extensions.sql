-- Deploy project-x:core_extensions to pg
-- requires: core_functions

-- Extended audit functionality
CREATE OR REPLACE FUNCTION core.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO core.audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_setting('app.current_user_id', true)::UUID,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Configuration table for feature flags
CREATE TABLE core.config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_config_timestamp
    BEFORE UPDATE ON core.config
    FOR EACH ROW
    EXECUTE FUNCTION core.update_timestamp();
