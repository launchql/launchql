-- Revert tagged-partial:b from pg

BEGIN;

DROP TABLE IF EXISTS test_b;

COMMIT;
