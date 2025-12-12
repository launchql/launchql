-- Revert schemas/status_public/schema from pg

BEGIN;

DROP SCHEMA status_public;

COMMIT;
