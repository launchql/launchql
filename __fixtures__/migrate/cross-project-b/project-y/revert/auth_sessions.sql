-- Revert project-y:auth_sessions from pg

BEGIN;

DROP TABLE IF EXISTS auth.sessions CASCADE;

COMMIT;