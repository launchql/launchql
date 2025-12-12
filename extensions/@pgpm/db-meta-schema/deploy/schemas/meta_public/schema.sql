-- Deploy schemas/meta_public/schema to pg


BEGIN;

CREATE SCHEMA meta_public;

GRANT USAGE ON SCHEMA meta_public TO authenticated;
GRANT USAGE ON SCHEMA meta_public TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON TABLES TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON SEQUENCES TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA meta_public GRANT ALL ON FUNCTIONS TO administrator;


COMMIT;
