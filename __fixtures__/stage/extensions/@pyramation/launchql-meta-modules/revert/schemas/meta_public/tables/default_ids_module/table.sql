-- Revert schemas/meta_public/tables/default_ids_module/table from pg

BEGIN;

DROP TABLE meta_public.default_ids_module;

COMMIT;
