-- Verify schemas/unique_names/schema  on pg

BEGIN;

SELECT verify_schema ('unique_names');

ROLLBACK;
