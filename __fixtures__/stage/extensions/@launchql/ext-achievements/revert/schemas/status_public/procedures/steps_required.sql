-- Revert schemas/status_public/procedures/steps_required from pg

BEGIN;

DROP FUNCTION status_public.tasks_required_for;

COMMIT;
