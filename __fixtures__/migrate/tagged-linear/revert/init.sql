-- Revert tagged-linear:init from pg

BEGIN;

-- Drop the app schema if it exists
DROP SCHEMA IF EXISTS app CASCADE;

COMMIT;