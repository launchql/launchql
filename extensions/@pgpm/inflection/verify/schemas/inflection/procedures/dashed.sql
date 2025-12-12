-- Verify schemas/inflection/procedures/dashed  on pg

BEGIN;

SELECT verify_function ('inflection.dashed');

ROLLBACK;
