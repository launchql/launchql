-- Deploy project-x:core_types to pg
-- requires: core_schema

BEGIN;

-- Create custom types used across projects
CREATE TYPE core.status_enum AS ENUM ('active', 'inactive', 'pending', 'archived');
CREATE TYPE core.priority_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Create a base audit table structure
CREATE TABLE core.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    old_data JSONB,
    new_data JSONB
);

COMMIT;