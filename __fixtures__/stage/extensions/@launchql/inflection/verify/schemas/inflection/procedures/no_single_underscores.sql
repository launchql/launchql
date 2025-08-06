-- Verify schemas/inflection/procedures/no_single_underscores  on pg

BEGIN;

SELECT verify_function ('inflection.no_single_underscores');

ROLLBACK;
