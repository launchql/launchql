-- Deploy procedures/verify_view to pg

-- requires: procedures/get_entity_from_str 
-- requires: procedures/get_schema_from_str 


BEGIN;
CREATE FUNCTION verify_view (_view text)
    RETURNS boolean
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            *
        FROM
            information_schema.views
        WHERE
            table_schema = get_schema_from_str (_view)
            AND table_name = get_entity_from_str (_view)) THEN
    RETURN TRUE;
ELSE
    RAISE EXCEPTION 'Nonexistent view --> %', _view
        USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;

