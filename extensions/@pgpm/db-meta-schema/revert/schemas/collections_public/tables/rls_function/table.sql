-- Revert schemas/collections_public/tables/rls_function/table from pg

BEGIN;

DROP TABLE collections_public.rls_function;

COMMIT;
