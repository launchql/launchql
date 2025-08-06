-- Verify schemas/uuids/schema  on pg

BEGIN;

SELECT verify_schema ('uuids');

ROLLBACK;
