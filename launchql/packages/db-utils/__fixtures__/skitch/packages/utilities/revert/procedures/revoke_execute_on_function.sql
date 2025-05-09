-- Revert procedures/revoke_execute_on_function from pg

BEGIN;

DROP FUNCTION public.revoke_execute_on_function;

COMMIT;
