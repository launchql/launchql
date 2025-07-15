-- Revert project-x:core_functions from pg

DROP FUNCTION IF EXISTS core.update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS core.generate_slug(TEXT) CASCADE;
