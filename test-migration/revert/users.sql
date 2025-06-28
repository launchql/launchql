-- Revert test-project:users from pg

BEGIN;

DROP TABLE IF EXISTS app.users CASCADE;

COMMIT;