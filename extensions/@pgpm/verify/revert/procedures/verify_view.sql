-- Revert procedures/verify_view from pg

BEGIN;

DROP FUNCTION public.verify_view;

COMMIT;
