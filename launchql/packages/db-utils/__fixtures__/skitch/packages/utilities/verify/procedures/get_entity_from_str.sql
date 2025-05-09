-- Verify procedures/get_entity_from_str  on pg

BEGIN;

SELECT get_entity_from_str('a.b');

ROLLBACK;
