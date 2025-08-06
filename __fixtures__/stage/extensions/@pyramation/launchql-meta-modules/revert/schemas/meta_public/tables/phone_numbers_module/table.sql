-- Revert schemas/meta_public/tables/phone_numbers_module/table from pg

BEGIN;

DROP TABLE meta_public.phone_numbers_module;

COMMIT;
