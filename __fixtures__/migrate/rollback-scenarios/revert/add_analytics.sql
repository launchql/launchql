-- Revert rollback-scenarios:add_analytics from pg
BEGIN;
-- add_analytics rollback
COMMIT;
