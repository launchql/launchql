-- Verify schemas/meta_public/tables/uuid_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.uuid_module');

ROLLBACK;
