-- Deploy procedures/verify_policy to pg

-- requires: procedures/get_entity_from_str 
-- requires: procedures/get_schema_from_str 


BEGIN;

CREATE FUNCTION verify_policy (_policy text, _table text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_class p
            JOIN pg_catalog.pg_namespace n ON n.oid = p.relnamespace
            JOIN pg_policy pol ON pol.polrelid = p.relfilenode
        WHERE
            pol.polname = _policy
            AND relrowsecurity = 'true'
            AND relname = get_entity_from_str (_table)
            AND nspname = get_schema_from_str (_table)) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent policy or missing relrowsecurity --> %', _policy
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

