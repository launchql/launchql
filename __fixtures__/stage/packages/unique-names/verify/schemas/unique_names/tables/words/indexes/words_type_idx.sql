-- Verify schemas/unique_names/tables/words/indexes/words_type_idx  on pg

BEGIN;

SELECT verify_index ('unique_names.words', 'words_type_idx');

ROLLBACK;
