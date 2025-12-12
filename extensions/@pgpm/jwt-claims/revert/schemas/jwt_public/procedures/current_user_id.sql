-- Revert schemas/jwt_public/procedures/current_user_id from pg

BEGIN;

DROP FUNCTION jwt_public.current_user_id;

COMMIT;
