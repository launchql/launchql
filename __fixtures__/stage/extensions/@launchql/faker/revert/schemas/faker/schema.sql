-- Revert schemas/faker/schema from pg

BEGIN;

DROP SCHEMA faker;

COMMIT;
