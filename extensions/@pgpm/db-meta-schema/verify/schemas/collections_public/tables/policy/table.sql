-- Verify schemas/collections_public/tables/policy/table on pg

BEGIN;

SELECT verify_table ('collections_public.policy');

ROLLBACK;
