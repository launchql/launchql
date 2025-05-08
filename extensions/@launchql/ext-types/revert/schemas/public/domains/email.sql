-- Revert schemas/public/domains/email from pg

BEGIN;

DROP TYPE public.email;

COMMIT;
