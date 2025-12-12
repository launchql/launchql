-- Verify schemas/meta_public/tables/apis/table on pg

BEGIN;

SELECT verify_table ('meta_public.apis');

ROLLBACK;
