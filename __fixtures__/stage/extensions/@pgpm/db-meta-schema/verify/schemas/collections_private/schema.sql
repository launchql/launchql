-- Verify schemas/collections_private/schema  on pg

BEGIN;

SELECT verify_schema ('collections_private');

ROLLBACK;
