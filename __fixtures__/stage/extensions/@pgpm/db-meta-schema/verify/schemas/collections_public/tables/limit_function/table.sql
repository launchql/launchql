-- Verify schemas/collections_public/tables/limit_function/table on pg

BEGIN;

SELECT verify_table ('collections_public.limit_function');

ROLLBACK;
