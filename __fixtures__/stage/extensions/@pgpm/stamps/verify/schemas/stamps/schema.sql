-- Verify schemas/stamps/schema  on pg

BEGIN;

SELECT verify_schema ('stamps');

ROLLBACK;
