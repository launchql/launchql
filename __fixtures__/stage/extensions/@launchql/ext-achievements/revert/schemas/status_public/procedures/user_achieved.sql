-- Revert schemas/status_public/procedures/user_achieved from pg

BEGIN;

DROP FUNCTION status_public.user_achieved;

COMMIT;
