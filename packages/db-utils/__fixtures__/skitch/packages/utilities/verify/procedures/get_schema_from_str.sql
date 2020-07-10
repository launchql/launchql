-- Verify procedures/get_schema_from_str on pg

BEGIN;

SELECT get_schema_from_str('a.b');

ROLLBACK;
