-- Verify schemas/inflection/procedures/slugify  on pg

BEGIN;

SELECT verify_function ('inflection.slugify');

ROLLBACK;
