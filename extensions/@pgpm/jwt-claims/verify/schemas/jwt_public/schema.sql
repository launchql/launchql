-- Verify schemas/jwt_public/schema  on pg

BEGIN;

SELECT verify_schema ('jwt_public');

ROLLBACK;
