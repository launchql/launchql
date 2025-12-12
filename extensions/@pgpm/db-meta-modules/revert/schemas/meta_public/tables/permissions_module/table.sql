-- Revert schemas/meta_public/tables/permissions_module/table from pg

BEGIN;

DROP TABLE meta_public.permissions_module;

COMMIT;
