-- Revert schemas/meta_public/tables/rls_module/table from pg

BEGIN;

DROP TABLE meta_public.rls_module;

COMMIT;
