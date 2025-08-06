-- Revert schemas/jwt_public/schema from pg

BEGIN;

DROP SCHEMA jwt_public;

COMMIT;
