-- Revert schemas/status_public/tables/user_achievements/policies/user_achievements_policy from pg

BEGIN;


REVOKE INSERT ON TABLE status_public.user_achievements FROM authenticated;
REVOKE SELECT ON TABLE status_public.user_achievements FROM authenticated;
REVOKE UPDATE ON TABLE status_public.user_achievements FROM authenticated;
REVOKE DELETE ON TABLE status_public.user_achievements FROM authenticated;


DROP POLICY can_select_user_achievements ON status_public.user_achievements;
DROP POLICY can_insert_user_achievements ON status_public.user_achievements;
DROP POLICY can_update_user_achievements ON status_public.user_achievements;
DROP POLICY can_delete_user_achievements ON status_public.user_achievements;

DROP FUNCTION status_private.user_achievements_policy_fn;

COMMIT;
