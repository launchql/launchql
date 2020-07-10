-- Deploy procedures/verify_trigger to pg


BEGIN;

CREATE FUNCTION verify_trigger (_trigger text)
    RETURNS boolean
AS $$
BEGIN
    IF EXISTS (
            SELECT
                pg_trigger.tgname,
                n.nspname
            FROM
                pg_trigger,
                pg_catalog.pg_namespace n
            WHERE
                tgname = get_entity_from_str(_trigger) AND nspname = get_schema_from_str(_trigger)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent trigger --> %s', _trigger
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

COMMIT;
