-- Verify schemas/inflection/procedures/underscore  on pg

BEGIN;

SELECT verify_function ('inflection.underscore');

ROLLBACK;
