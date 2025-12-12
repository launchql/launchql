-- Deploy schemas/collections_private/schema to pg

BEGIN;

CREATE SCHEMA collections_private;

GRANT USAGE ON SCHEMA collections_private TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_private GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_private GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collections_private GRANT ALL ON FUNCTIONS TO authenticated;

COMMIT;
