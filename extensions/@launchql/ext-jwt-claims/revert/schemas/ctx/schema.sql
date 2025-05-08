-- Revert schemas/ctx/schema from pg

BEGIN;

DROP SCHEMA ctx;

COMMIT;
