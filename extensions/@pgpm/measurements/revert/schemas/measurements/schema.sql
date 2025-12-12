-- Revert schemas/measurements/schema from pg

BEGIN;

DROP SCHEMA measurements;

COMMIT;
