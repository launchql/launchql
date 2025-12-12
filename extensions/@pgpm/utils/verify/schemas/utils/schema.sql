-- Verify schemas/utils/schema  on pg

BEGIN;

SELECT verify_schema ('utils');

ROLLBACK;
