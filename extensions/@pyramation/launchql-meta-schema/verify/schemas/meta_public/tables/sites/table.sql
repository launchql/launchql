-- Verify schemas/meta_public/tables/sites/table on pg

BEGIN;

SELECT verify_table ('meta_public.sites');

ROLLBACK;
