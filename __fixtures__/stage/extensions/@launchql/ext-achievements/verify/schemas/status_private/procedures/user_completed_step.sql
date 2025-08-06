-- Verify schemas/status_private/procedures/user_completed_step  on pg

BEGIN;

SELECT verify_function ('status_private.user_completed_step');

ROLLBACK;
