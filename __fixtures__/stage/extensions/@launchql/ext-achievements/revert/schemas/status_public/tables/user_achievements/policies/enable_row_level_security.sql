-- Revert schemas/status_public/tables/user_achievements/policies/enable_row_level_security from pg

BEGIN;

ALTER TABLE status_public.user_achievements
    DISABLE ROW LEVEL SECURITY;

COMMIT;
