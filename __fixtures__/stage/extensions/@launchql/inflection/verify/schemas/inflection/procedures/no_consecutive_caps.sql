-- Verify schemas/inflection/procedures/no_consecutive_caps  on pg

BEGIN;

SELECT verify_function ('inflection.no_consecutive_caps');

ROLLBACK;
