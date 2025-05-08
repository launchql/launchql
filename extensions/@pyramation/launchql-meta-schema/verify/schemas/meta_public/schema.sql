-- Verify schemas/meta_public/schema  on pg

BEGIN;

SELECT verify_schema ('meta_public');

ROLLBACK;
