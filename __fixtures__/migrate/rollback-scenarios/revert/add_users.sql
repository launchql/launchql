-- Revert rollback-scenarios:add_users from pg
BEGIN;
-- add_users rollback
COMMIT;
