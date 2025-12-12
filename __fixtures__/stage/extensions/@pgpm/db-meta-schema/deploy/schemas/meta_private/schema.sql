-- Deploy schemas/meta_private/schema to pg


BEGIN;

CREATE SCHEMA meta_private;

GRANT USAGE ON SCHEMA meta_private TO authenticated;
GRANT USAGE ON SCHEMA meta_private TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_private GRANT ALL ON TABLES TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_private GRANT ALL ON SEQUENCES TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_private GRANT ALL ON FUNCTIONS TO administrator;

COMMIT;
