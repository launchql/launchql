-- Verify schemas/status_private/schema  on pg

BEGIN;

SELECT verify_schema ('status_private');

ROLLBACK;
