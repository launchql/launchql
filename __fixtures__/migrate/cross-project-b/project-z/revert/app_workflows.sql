-- Revert project-z:app_workflows from pg

BEGIN;

DROP FUNCTION IF EXISTS app.can_execute_workflow(UUID, UUID) CASCADE;
DROP TABLE IF EXISTS app.workflow_steps CASCADE;
DROP TABLE IF EXISTS app.workflows CASCADE;

COMMIT;