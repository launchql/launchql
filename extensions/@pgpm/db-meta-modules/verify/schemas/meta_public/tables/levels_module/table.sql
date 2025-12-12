-- Verify schemas/meta_public/tables/levels_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.levels_module');

ROLLBACK;
