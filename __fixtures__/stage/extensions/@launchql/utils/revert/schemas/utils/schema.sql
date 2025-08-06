-- Revert schemas/utils/schema from pg

BEGIN;

DROP SCHEMA utils;

COMMIT;
