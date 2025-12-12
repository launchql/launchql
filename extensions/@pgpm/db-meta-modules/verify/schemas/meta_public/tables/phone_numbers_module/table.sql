-- Verify schemas/meta_public/tables/phone_numbers_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.phone_numbers_module');

ROLLBACK;
