\echo Use "CREATE EXTENSION launchql-defaults" to load this file. \quit
DO $EOFCODE$
DECLARE
  sql text;
BEGIN
  SELECT
    format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) INTO sql;
  EXECUTE sql;
END
$EOFCODE$;

ALTER DEFAULT PRIVILEGES
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC RESTRICT;

REVOKE CREATE ON SCHEMA public FROM PUBLIC RESTRICT;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO authenticated, anonymous, administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO authenticated, anonymous, administrator;
