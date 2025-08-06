-- Revert schemas/meta_public/tables/denormalized_table_field/table from pg

BEGIN;

DROP TABLE meta_public.denormalized_fields_tables;

COMMIT;
