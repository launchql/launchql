-- Revert schemas/status_public/tables/user_steps/triggers/update_achievements_tg from pg

BEGIN;

DROP TRIGGER update_achievements_tg ON status_public.user_steps;
DROP FUNCTION status_private.tg_update_achievements_tg; 

COMMIT;
