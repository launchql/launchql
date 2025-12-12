-- Revert launchql-verify:procedures/get_schema_from_str from pg

BEGIN;

DROP FUNCTION get_schema_from_str(text);

COMMIT;
