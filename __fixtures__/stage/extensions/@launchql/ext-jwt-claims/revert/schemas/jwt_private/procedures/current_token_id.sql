-- Revert schemas/jwt_private/procedures/current_token_id from pg

BEGIN;

DROP FUNCTION jwt_private.current_token_id;

COMMIT;
