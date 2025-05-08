-- Revert schemas/status_private/schema from pg

BEGIN;

DROP SCHEMA status_private;

COMMIT;
