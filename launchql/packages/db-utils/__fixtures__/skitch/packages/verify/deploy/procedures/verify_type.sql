-- Deploy procedures/verify_type to pg


BEGIN;

CREATE FUNCTION verify_type (_type text)
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
                typname = get_entity_from_str(_type) AND nspname = get_schema_from_str(_type)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent type --> %s', _type
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

COMMIT;
