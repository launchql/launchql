-- Revert tagged-partial:d from pg

BEGIN;

DROP TABLE IF EXISTS test_d;

COMMIT;
