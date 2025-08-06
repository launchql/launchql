-- Verify schemas/meta_private/schema  on pg

BEGIN;

SELECT verify_schema ('meta_private');

ROLLBACK;
