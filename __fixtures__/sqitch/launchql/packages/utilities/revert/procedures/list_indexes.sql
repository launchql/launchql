-- Revert procedures/list_indexes from pg

BEGIN;

DROP FUNCTION list_indexes;

COMMIT;
