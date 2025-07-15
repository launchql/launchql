-- Revert project-y:auth_permissions from pg

BEGIN;

-- Remove config entry
DELETE FROM core.config WHERE key = 'auth.permissions.cache_ttl';

DROP FUNCTION IF EXISTS auth.has_permission(UUID, TEXT, TEXT) CASCADE;
DROP TABLE IF EXISTS auth.role_permissions CASCADE;
DROP TABLE IF EXISTS auth.permissions CASCADE;

COMMIT;