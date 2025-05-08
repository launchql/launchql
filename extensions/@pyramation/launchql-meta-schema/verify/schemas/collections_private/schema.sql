-- Verify schemas/collections_private/schema  on pg

BEGIN;

SELECT verify_schema ('dbs');

ROLLBACK;
