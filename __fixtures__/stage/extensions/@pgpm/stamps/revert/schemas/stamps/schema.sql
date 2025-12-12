-- Revert schemas/stamps/schema from pg

BEGIN;

DROP SCHEMA stamps;

COMMIT;
