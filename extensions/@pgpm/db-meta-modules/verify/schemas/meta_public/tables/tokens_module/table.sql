-- Verify schemas/meta_public/tables/tokens_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.tokens_module');

ROLLBACK;
