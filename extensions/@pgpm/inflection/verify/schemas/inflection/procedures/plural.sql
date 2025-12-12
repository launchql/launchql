-- Verify schemas/inflection/procedures/plural  on pg

BEGIN;

SELECT verify_function ('inflection.plural');

ROLLBACK;
