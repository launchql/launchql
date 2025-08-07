-- Deploy schemas/unique_names/schema to pg

-- requires: launchql-ext-default-roles:@0.0.5
-- requires: launchql-ext-defaults:defaults/public
-- requires: launchql-ext-verify:procedures/verify_view

BEGIN;

CREATE SCHEMA unique_names;

COMMIT;
