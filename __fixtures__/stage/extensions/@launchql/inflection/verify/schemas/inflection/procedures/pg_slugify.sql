-- Verify schemas/inflection/procedures/pg_slugify  on pg

BEGIN;

SELECT verify_function ('inflection.pg_slugify');

ROLLBACK;
