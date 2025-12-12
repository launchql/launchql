-- Deploy schemas/status_public/tables/user_achievements/policies/enable_row_level_security to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/tables/user_achievements/table

BEGIN;

ALTER TABLE status_public.user_achievements
    ENABLE ROW LEVEL SECURITY;

COMMIT;
