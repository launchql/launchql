-- Deploy procedures/list_indexes to pg
-- requires: procedures/get_entity_from_str
-- requires: procedures/get_schema_from_str

BEGIN;

CREATE FUNCTION list_indexes (_table text, _index text)
    RETURNS TABLE (schema_name text, table_name text, index_name text)
AS $$
SELECT
    n.nspname::text AS schema_name,
    t.relname::text AS table_name,
    i.relname::text AS index_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_catalog.pg_namespace n
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND n.oid = i.relnamespace
    AND n.nspname = get_schema_from_str(_table)
    AND i.relname = _index
    AND t.relname = get_entity_from_str(_table);
$$
LANGUAGE 'sql' IMMUTABLE;

COMMIT;
