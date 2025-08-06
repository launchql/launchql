-- Revert schemas/unique_names/tables/words/indexes/words_type_idx from pg

BEGIN;

DROP INDEX unique_names.words_type_idx;

COMMIT;
