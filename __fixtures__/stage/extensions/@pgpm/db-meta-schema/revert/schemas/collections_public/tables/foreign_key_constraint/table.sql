-- Revert schemas/collections_public/tables/foreign_key_constraint/table from pg

BEGIN;

DROP TABLE collections_public.foreign_key_constraint;

COMMIT;
