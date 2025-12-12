-- Verify schemas/status_private/procedures/user_incompleted_step  on pg

BEGIN;

SELECT verify_function ('status_private.user_incompleted_step');

ROLLBACK;
