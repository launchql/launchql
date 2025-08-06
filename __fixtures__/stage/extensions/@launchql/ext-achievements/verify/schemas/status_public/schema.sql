-- Verify schemas/status_public/schema  on pg

BEGIN;

SELECT verify_schema ('status_public');

ROLLBACK;
