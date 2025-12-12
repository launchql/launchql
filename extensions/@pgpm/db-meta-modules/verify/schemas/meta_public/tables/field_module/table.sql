-- Verify schemas/meta_public/tables/field_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.field_module');

ROLLBACK;
