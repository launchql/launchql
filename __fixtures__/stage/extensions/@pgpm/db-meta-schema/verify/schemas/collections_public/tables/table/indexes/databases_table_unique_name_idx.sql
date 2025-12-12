
BEGIN;

SELECT verify_index ('collections_public.table', 'databases_table_unique_name_idx');

ROLLBACK;
