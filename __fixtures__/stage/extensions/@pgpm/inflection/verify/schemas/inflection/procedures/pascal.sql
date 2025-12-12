-- Verify schemas/inflection/procedures/pascal  on pg

BEGIN;

SELECT verify_function ('inflection.pascal');

ROLLBACK;
