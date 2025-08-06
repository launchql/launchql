-- Revert schemas/public/domains/hostname from pg

BEGIN;

DROP TYPE public.domain;

COMMIT;
