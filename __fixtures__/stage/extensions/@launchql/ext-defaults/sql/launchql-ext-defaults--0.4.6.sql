\echo Use "CREATE EXTENSION launchql-ext-defaults" to load this file. \quit
DO $$
  DECLARE
  sql text;
BEGIN
  SELECT
    format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) INTO sql;
  EXECUTE sql;
END $$;

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS  FROM PUBLIC;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;