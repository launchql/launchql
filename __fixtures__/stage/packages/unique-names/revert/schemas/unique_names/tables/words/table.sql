-- Revert schemas/unique_names/tables/words/table from pg

BEGIN;

DROP TABLE unique_names.words;

COMMIT;
