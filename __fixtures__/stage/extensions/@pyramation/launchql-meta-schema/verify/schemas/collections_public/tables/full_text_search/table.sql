-- Verify schemas/collections_public/tables/full_text_search/table on pg

BEGIN;

SELECT verify_table ('collections_public.full_text_search');

ROLLBACK;
