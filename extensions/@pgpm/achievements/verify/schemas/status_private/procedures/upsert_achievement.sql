-- Verify schemas/status_private/procedures/upsert_achievement  on pg

BEGIN;

SELECT verify_function ('status_private.upsert_achievement');

ROLLBACK;
