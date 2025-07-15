-- Revert project-x:core_types from pg

BEGIN;

DROP TABLE IF EXISTS core.audit_log CASCADE;
DROP TYPE IF EXISTS core.priority_enum CASCADE;
DROP TYPE IF EXISTS core.status_enum CASCADE;

COMMIT;