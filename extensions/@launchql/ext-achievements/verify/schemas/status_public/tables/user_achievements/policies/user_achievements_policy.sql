-- Verify schemas/status_public/tables/user_achievements/policies/user_achievements_policy  on pg

BEGIN;

SELECT verify_policy ('can_select_user_achievements', 'status_public.user_achievements');
SELECT verify_policy ('can_insert_user_achievements', 'status_public.user_achievements');
SELECT verify_policy ('can_update_user_achievements', 'status_public.user_achievements');
SELECT verify_policy ('can_delete_user_achievements', 'status_public.user_achievements');

SELECT verify_function ('status_private.user_achievements_policy_fn');


SELECT has_table_privilege('authenticated', 'status_public.user_achievements', 'INSERT');
SELECT has_table_privilege('authenticated', 'status_public.user_achievements', 'SELECT');
SELECT has_table_privilege('authenticated', 'status_public.user_achievements', 'UPDATE');
SELECT has_table_privilege('authenticated', 'status_public.user_achievements', 'DELETE');

ROLLBACK;
