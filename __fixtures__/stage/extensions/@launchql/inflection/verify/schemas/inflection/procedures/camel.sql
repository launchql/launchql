-- Verify schemas/inflection/procedures/camel  on pg

BEGIN;

SELECT verify_function ('inflection.camel');

ROLLBACK;
