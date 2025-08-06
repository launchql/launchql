-- Verify schemas/status_public/tables/user_steps/triggers/update_achievements_tg  on pg

BEGIN;

SELECT verify_function ('status_private.tg_update_achievements_tg'); 
SELECT verify_trigger ('status_public.update_achievements_tg');

ROLLBACK;
