-- Revert project-y:auth_sessions from pg

DROP TABLE IF EXISTS auth.sessions CASCADE;
