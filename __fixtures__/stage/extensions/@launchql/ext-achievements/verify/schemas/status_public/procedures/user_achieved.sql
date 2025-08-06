-- Verify schemas/status_public/procedures/user_achieved  on pg

BEGIN;

SELECT verify_function ('status_public.user_achieved');

ROLLBACK;
