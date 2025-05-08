-- Revert schemas/meta_public/tables/limits_module/table from pg

BEGIN;

DROP TABLE meta_public.limits_module;

COMMIT;
