-- Revert project-y:auth_roles from pg

DROP TABLE IF EXISTS auth.user_roles CASCADE;
DROP TABLE IF EXISTS auth.roles CASCADE;
