-- Revert schemas/collections_public/tables/unique_constraint/table from pg

BEGIN;

DROP TABLE collections_public.unique_constraint;

COMMIT;
