-- Revert procedures/get_entity_from_str from pg

BEGIN;

DROP FUNCTION get_entity_from_str;

COMMIT;
