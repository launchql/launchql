-- Revert schemas/status_public/tables/user_achievements/table from pg

BEGIN;

DROP TABLE status_public.user_achievements;

COMMIT;
