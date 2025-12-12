-- Verify schemas/inflection/procedures/lower  on pg

BEGIN;

SELECT verify_function ('inflection.lower');

ROLLBACK;
