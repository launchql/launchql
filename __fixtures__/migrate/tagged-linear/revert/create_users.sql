-- Revert tagged-linear:create_users from pg

BEGIN;

DROP TABLE IF EXISTS app.users CASCADE;

COMMIT;