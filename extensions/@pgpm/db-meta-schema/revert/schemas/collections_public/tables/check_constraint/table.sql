-- Revert schemas/collections_public/tables/check_constraint/table from pg

BEGIN;

DROP TABLE collections_public.check_constraint;

COMMIT;
