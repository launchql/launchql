-- Verify schemas/meta_public/tables/memberships_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.memberships_module');

ROLLBACK;
