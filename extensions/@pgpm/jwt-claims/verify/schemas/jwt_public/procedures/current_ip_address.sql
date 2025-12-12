-- Verify schemas/jwt_public/procedures/current_ip_address  on pg

BEGIN;

SELECT verify_function ('jwt_public.current_ip_address');

ROLLBACK;
