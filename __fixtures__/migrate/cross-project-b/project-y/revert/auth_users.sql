-- Revert project-y:auth_users from pg

DROP TABLE IF EXISTS auth.users CASCADE;
