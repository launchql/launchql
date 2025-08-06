-- Revert schemas/public/domains/origin from pg

BEGIN;

DROP TYPE public.origin;

COMMIT;
