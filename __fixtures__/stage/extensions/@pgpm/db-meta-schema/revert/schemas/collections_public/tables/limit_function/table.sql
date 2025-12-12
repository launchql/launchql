-- Revert schemas/collections_public/tables/limit_function/table from pg

BEGIN;

DROP TABLE collections_public.limit_function;

COMMIT;
