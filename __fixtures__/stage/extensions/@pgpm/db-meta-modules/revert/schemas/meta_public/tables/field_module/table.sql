-- Revert schemas/meta_public/tables/field_module/table from pg

BEGIN;

DROP TABLE meta_public.field_module;

COMMIT;
