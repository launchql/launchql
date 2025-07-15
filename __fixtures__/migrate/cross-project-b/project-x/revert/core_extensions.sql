-- Revert project-x:core_extensions from pg

BEGIN;

DROP TABLE IF EXISTS core.config CASCADE;
DROP FUNCTION IF EXISTS core.audit_trigger() CASCADE;

COMMIT;