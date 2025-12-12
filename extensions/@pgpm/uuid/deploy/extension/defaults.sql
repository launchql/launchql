-- Deploy extension/defaults to pg

BEGIN;

-- hstore
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

COMMIT;
