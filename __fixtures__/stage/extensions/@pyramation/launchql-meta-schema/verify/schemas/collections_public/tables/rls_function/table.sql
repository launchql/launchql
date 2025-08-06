-- Verify schemas/collections_public/tables/rls_function/table on pg

BEGIN;

SELECT verify_table ('collections_public.rls_function');

ROLLBACK;
