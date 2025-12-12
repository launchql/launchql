-- Revert schemas/jwt_public/procedures/current_group_ids from pg

BEGIN;

DROP FUNCTION jwt_public.current_group_ids;

COMMIT;
