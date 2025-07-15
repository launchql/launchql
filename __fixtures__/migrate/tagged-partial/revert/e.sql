-- Revert tagged-partial:e from pg

BEGIN;

DROP TABLE IF EXISTS test_e;

COMMIT;
