-- Revert test-simple:schema from pg

BEGIN;

DROP SCHEMA test_app CASCADE;

COMMIT;