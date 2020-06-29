-- Revert procedures/drop_function from pg

BEGIN;

DROP FUNCTION public.drop_function;

COMMIT;
