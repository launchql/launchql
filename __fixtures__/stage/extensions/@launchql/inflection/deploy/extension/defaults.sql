-- Deploy extension/defaults to pg

BEGIN;

-- hstore, unaccent
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

COMMIT;
