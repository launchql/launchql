-- Deploy procedures/verify_security to pg

-- requires: procedures/get_entity_from_str 
-- requires: procedures/get_schema_from_str 

BEGIN;
CREATE FUNCTION verify_security (_table text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            n.oid,
            relname,
            n.nspname
        FROM
            pg_class p
            JOIN pg_catalog.pg_namespace n ON n.oid = p.relnamespace
        WHERE
            relrowsecurity = 'true'
            AND relname = get_entity_from_str (_table)
            AND nspname = get_schema_from_str (_table)) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent security --> %', _name
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

