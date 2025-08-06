-- Revert schemas/jwt_private/procedures/current_database_id from pg

BEGIN;

DROP FUNCTION jwt_private.current_database_id;

COMMIT;
