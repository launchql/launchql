-- Verify schemas/inflection/procedures/should_skip_uncountable  on pg

BEGIN;

SELECT verify_function ('inflection.should_skip_uncountable');

ROLLBACK;
