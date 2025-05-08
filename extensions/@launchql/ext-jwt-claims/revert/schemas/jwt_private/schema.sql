-- Revert schemas/jwt_private/schema from pg

BEGIN;

DROP SCHEMA jwt_private;

COMMIT;
