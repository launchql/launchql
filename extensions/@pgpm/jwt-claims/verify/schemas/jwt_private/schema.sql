-- Verify schemas/jwt_private/schema  on pg

BEGIN;

SELECT verify_schema ('jwt_private');

ROLLBACK;
