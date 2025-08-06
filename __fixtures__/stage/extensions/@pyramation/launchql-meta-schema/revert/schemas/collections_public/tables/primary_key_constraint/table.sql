-- Revert schemas/collections_public/tables/primary_key_constraint/table from pg

BEGIN;

DROP TABLE collections_public.primary_key_constraint;

COMMIT;
