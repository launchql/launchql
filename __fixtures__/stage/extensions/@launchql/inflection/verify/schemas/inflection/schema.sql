-- Verify schemas/inflection/schema  on pg

BEGIN;

SELECT verify_schema ('inflection');

ROLLBACK;
