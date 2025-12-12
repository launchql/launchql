-- Verify schemas/jwt_public/procedures/current_group_ids  on pg

BEGIN;

SELECT verify_function ('jwt_public.current_group_ids');

ROLLBACK;
