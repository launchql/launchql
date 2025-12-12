-- Verify schemas/inflection/procedures/uncountable_words  on pg

BEGIN;

SELECT verify_function ('inflection.uncountable_words');

ROLLBACK;
