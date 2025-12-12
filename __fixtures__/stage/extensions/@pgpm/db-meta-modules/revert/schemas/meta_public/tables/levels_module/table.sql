-- Revert schemas/meta_public/tables/levels_module/table from pg

BEGIN;

DROP TABLE meta_public.levels_module;

COMMIT;
