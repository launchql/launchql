-- Revert tagged-partial:a from pg

BEGIN;

DROP TABLE IF EXISTS test_a;

COMMIT;
