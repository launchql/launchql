-- Revert procedures/verify_extension from pg

BEGIN;

DROP FUNCTION public.verify_extension;

COMMIT;
