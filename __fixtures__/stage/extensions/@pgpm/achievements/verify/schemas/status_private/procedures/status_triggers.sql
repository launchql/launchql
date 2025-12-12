-- Verify schemas/status_private/procedures/status_triggers  on pg

BEGIN;

SELECT verify_function ('status_private.tg_achievement');
SELECT verify_function ('status_private.tg_achievement_toggle');
SELECT verify_function ('status_private.tg_achievement_boolean');
SELECT verify_function ('status_private.tg_achievement_toggle_boolean');

ROLLBACK;
