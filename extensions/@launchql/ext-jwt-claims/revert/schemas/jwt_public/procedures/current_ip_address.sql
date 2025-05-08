-- Revert schemas/jwt_public/procedures/current_ip_address from pg

BEGIN;

DROP FUNCTION jwt_public.current_ip_address;

COMMIT;
