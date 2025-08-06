-- Revert schemas/public/domains/single_select from pg

BEGIN;

DROP TYPE public.single_select;

COMMIT;
