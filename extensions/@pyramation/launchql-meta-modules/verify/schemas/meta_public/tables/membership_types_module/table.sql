-- Verify schemas/meta_public/tables/membership_types_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.membership_types_module');

ROLLBACK;
