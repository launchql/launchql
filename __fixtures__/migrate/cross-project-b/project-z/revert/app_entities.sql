-- Revert project-z:app_entities from pg

BEGIN;

DROP TABLE IF EXISTS app.projects CASCADE;
DROP TABLE IF EXISTS app.organizations CASCADE;

COMMIT;