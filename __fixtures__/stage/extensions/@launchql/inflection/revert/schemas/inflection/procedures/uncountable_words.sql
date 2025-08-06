-- Revert schemas/inflection/procedures/uncountable_words from pg

BEGIN;

DROP FUNCTION inflection.uncountable_words;

COMMIT;
