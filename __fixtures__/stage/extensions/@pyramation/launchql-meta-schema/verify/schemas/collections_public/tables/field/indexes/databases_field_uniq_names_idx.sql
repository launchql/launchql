-- Verify schemas/collections_public/tables/field/indexes/databases_field_uniq_names_idx  on pg

BEGIN;

SELECT verify_index ('collections_public.field', 'databases_field_uniq_names_idx');

ROLLBACK;
