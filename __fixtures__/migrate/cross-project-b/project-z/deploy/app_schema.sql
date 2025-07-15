-- Deploy project-z:app_schema to pg
-- requires: project-x:@x1.1.0
-- requires: project-y:@y1.0.0

CREATE SCHEMA IF NOT EXISTS app;
COMMENT ON SCHEMA app IS 'Main application schema';

-- Verify dependencies are at correct versions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM core.config LIMIT 1) THEN
        RAISE EXCEPTION 'Core system not at required version';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 0) THEN
        RAISE EXCEPTION 'Auth system not at required version';
    END IF;
END $$;
