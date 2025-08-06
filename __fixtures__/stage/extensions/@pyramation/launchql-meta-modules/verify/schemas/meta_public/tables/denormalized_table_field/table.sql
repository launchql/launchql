-- Verify schemas/meta_public/tables/denormalized_table_field/table on pg

BEGIN;

SELECT verify_table ('meta_public.denormalized_fields_tables');

ROLLBACK;
