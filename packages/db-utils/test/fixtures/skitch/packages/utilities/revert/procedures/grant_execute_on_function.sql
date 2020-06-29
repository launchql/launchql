-- Revert procedures/grant_execute_on_function from pg

BEGIN;

DROP FUNCTION public.grant_execute_on_function;

COMMIT;
