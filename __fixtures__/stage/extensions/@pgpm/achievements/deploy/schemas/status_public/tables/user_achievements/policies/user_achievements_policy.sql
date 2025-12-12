-- Deploy schemas/status_public/tables/user_achievements/policies/user_achievements_policy to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/tables/user_achievements/table
-- requires: schemas/status_public/tables/user_achievements/policies/enable_row_level_security

BEGIN;

CREATE POLICY can_select_user_achievements ON status_public.user_achievements
  FOR SELECT
  USING (
    jwt_public.current_user_id() = user_id
  );

CREATE POLICY can_insert_user_achievements ON status_public.user_achievements
  FOR INSERT
  WITH CHECK (
    FALSE
  );

CREATE POLICY can_update_user_achievements ON status_public.user_achievements
  FOR UPDATE
  USING (
    FALSE
  );

CREATE POLICY can_delete_user_achievements ON status_public.user_achievements
  FOR DELETE
  USING (
    FALSE
  );

GRANT INSERT ON TABLE status_public.user_achievements TO authenticated;
GRANT SELECT ON TABLE status_public.user_achievements TO authenticated;
GRANT UPDATE ON TABLE status_public.user_achievements TO authenticated;
GRANT DELETE ON TABLE status_public.user_achievements TO authenticated;

COMMIT;
