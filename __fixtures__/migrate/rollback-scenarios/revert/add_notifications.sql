-- Revert rollback-scenarios:add_notifications from pg
BEGIN;
-- add_notifications rollback
COMMIT;
