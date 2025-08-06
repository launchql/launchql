-- Revert schemas/jwt_public/procedures/current_origin from pg

BEGIN;

DROP FUNCTION jwt_public.current_origin;

COMMIT;
