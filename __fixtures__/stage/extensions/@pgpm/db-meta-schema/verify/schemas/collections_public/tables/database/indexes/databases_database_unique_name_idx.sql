
BEGIN;

SELECT verify_index ('collections_public.database', 'databases_database_unique_name_idx');

ROLLBACK;
