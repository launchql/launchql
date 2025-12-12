-- Verify schemas/jwt_public/procedures/current_user_id  on pg

BEGIN;

SELECT verify_function ('jwt_public.current_user_id');

ROLLBACK;
