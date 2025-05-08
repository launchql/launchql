-- Verify schemas/inflection/procedures/slugify_trigger  on pg

BEGIN;

SELECT verify_function ('inflection.slugify_trigger');

ROLLBACK;
