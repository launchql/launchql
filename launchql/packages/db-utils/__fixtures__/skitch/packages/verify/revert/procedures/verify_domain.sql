-- Revert procedures/verify_domain from pg

BEGIN;

DROP FUNCTION public.verify_domain;

COMMIT;
