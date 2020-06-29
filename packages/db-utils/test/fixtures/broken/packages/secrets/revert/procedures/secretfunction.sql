-- Revert procedures/secretfunction from pg

BEGIN;

DROP FUNCTION public.secretfunction;

COMMIT;
