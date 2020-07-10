-- Deploy procedures/drop_function to pg

-- requires: procedures/get_entity_from_str
-- requires: procedures/get_schema_from_str

BEGIN;

CREATE FUNCTION drop_function (_functionname text, OUT func_drops int)
AS $$
DECLARE
    _sql text;
BEGIN
    SELECT
        count(*)::int,
        string_agg(format('DROP FUNCTION %s(%s);', p.oid::regproc, pg_get_function_identity_arguments(p.oid)), ' ')
    FROM
        pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE
        n.nspname = get_schema_from_str (_functionname)
        AND p.proname = get_entity_from_str (_functionname) INTO func_drops, _sql;
    IF func_drops > 0 THEN
        EXECUTE _sql;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent function --> %s', _functionname
            USING HINT = 'Please check';
    END IF;
END
$$
LANGUAGE plpgsql;

COMMIT;
