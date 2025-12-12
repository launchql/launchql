-- Verify schemas/inflection/procedures/upper  on pg

BEGIN;

SELECT verify_function ('inflection.upper');

ROLLBACK;
