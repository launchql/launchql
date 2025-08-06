-- Verify schemas/jwt_public/procedures/current_origin  on pg

BEGIN;

SELECT verify_function ('jwt_public.current_origin');

ROLLBACK;
