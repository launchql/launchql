-- Deploy procedures/verify_domain to pg

-- requires: procedures/get_entity_from_str 
-- requires: procedures/get_schema_from_str 

BEGIN;
CREATE FUNCTION verify_domain (_type text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            pg_type.typname,
            n.nspname
        FROM
            pg_type,
            pg_catalog.pg_namespace n
        WHERE
            typtype = 'd'
            AND typname = get_entity_from_str (_type)
            AND nspname = get_schema_from_str (_type)) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent type --> %', _type
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

