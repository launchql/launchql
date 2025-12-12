-- Revert schemas/status_private/procedures/status_triggers from pg

BEGIN;

DROP FUNCTION status_private.tg_achievement;
DROP FUNCTION status_private.tg_achievement_toggle;
DROP FUNCTION status_private.tg_achievement_boolean;
DROP FUNCTION status_private.tg_achievement_toggle_boolean;

COMMIT;
