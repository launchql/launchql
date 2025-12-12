-- Verify schemas/meta_public/tables/apps/table on pg

BEGIN;

SELECT verify_table ('meta_public.apps');

ROLLBACK;
