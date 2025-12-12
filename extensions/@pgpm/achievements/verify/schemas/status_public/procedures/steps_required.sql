-- Verify schemas/status_public/procedures/steps_required  on pg

BEGIN;

SELECT verify_function ('status_public.steps_required');

ROLLBACK;
