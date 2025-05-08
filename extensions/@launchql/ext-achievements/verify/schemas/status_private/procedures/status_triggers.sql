-- Verify schemas/status_private/procedures/status_triggers  on pg

BEGIN;

SELECT verify_function ('status_private.status_triggers');

ROLLBACK;
