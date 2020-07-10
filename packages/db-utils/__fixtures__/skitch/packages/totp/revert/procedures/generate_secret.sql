-- Revert procedures/generate_secret from pg

BEGIN;

DROP FUNCTION public.generate_secret;

COMMIT;
