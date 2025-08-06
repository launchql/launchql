-- Verify schemas/unique_names/tables/words/table on pg

BEGIN;

SELECT verify_table ('unique_names.words');

ROLLBACK;
