-- Verify schemas/measurements/schema  on pg

BEGIN;

SELECT verify_schema ('measurements');

ROLLBACK;
