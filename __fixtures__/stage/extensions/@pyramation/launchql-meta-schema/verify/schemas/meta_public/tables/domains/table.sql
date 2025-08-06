-- Verify schemas/meta_public/tables/domains/table on pg

BEGIN;

SELECT verify_table ('meta_public.domains');

ROLLBACK;
