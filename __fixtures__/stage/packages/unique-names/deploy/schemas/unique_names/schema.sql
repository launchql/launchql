-- Deploy schemas/unique_names/schema to pg

-- TODO remove this once we can use control file deps
-- requires: launchql-ext-default-roles:@0.0.5

BEGIN;

CREATE SCHEMA unique_names;

COMMIT;
