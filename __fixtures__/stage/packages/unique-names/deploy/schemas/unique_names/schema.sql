-- Deploy schemas/unique_names/schema to pg

-- requires: launchql-ext-default-roles:@0.0.5

BEGIN;

CREATE SCHEMA unique_names;

COMMIT;
