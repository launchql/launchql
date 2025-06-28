-- Revert test-simple:table from pg

BEGIN;

DROP TABLE test_app.users;

COMMIT;