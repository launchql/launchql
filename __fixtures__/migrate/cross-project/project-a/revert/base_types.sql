-- Revert project-a:base_types from pg

BEGIN;

DROP TYPE base.status;

COMMIT;