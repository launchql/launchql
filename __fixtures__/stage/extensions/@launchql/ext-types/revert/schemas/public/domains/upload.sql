-- Revert schemas/public/domains/upload from pg

BEGIN;

DROP TYPE public.upload;

COMMIT;
