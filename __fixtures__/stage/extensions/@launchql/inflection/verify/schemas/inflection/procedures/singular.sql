-- Verify schemas/inflection/procedures/singular  on pg

BEGIN;

SELECT verify_function ('inflection.singular');

ROLLBACK;
