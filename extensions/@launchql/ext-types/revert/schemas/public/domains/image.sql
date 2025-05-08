-- Revert schemas/public/domains/image from pg

BEGIN;

DROP TYPE public.image;

COMMIT;
