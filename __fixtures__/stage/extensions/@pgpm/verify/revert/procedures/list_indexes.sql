-- Revert launchql-verify:procedures/list_indexes from pg

BEGIN;

DROP FUNCTION list_indexes(text, text);

COMMIT;
