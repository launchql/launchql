-- Revert schemas/public/domains/multiple_select from pg

BEGIN;

DROP TYPE public.multiple_select;

COMMIT;
