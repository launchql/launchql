-- Revert tagged-partial:c from pg

BEGIN;

DROP TABLE IF EXISTS test_c;

COMMIT;
