-- Revert schemas/status_public/tables/user_steps/table from pg

BEGIN;

DROP TABLE status_public.user_steps;

COMMIT;
