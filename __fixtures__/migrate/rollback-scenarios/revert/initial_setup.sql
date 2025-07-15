-- Revert rollback-scenarios:initial_setup from pg
BEGIN;
-- initial_setup rollback
COMMIT;
