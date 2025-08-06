-- Verify schemas/ctx/schema  on pg

BEGIN;

SELECT verify_schema ('ctx');

ROLLBACK;
