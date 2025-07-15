-- Revert project-y:auth_users from pg

BEGIN;

DROP TABLE IF EXISTS auth.users CASCADE;

COMMIT;