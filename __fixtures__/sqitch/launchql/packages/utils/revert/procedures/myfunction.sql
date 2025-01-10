-- Revert procedures/myfunction from pg

BEGIN;

DROP FUNCTION public.myfunction;

COMMIT;
