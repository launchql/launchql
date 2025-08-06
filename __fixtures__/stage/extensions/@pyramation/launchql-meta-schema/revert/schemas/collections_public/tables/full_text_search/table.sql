-- Revert schemas/collections_public/tables/full_text_search/table from pg

BEGIN;

DROP TABLE collections_public.full_text_search;

COMMIT;
