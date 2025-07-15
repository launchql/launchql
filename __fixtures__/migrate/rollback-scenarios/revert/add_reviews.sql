-- Revert rollback-scenarios:add_reviews from pg
BEGIN;
-- add_reviews rollback
COMMIT;
