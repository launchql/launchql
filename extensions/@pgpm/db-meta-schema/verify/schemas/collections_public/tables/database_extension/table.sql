-- Verify schemas/collections_public/tables/database_extension/table on pg

BEGIN;

SELECT verify_table ('collections_public.database_extension');

ROLLBACK;
