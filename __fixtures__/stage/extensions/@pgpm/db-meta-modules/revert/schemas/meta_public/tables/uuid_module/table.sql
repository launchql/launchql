-- Revert schemas/meta_public/tables/uuid_module/table from pg

BEGIN;

DROP TABLE meta_public.uuid_module;

COMMIT;
